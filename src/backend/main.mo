import Map "mo:core/Map";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserProfile = {
    name : Text;
    totalProblemsSolved : Nat;
    totalFine : Nat;
    currentStreak : Nat;
    badge : ?Badge;
  };

  type DailyRecord = {
    date : Time.Time;
    problemsSolved : Nat;
    penaltyApplied : Nat;
  };

  public type Message = {
    sender : Principal.Principal;
    receiver : Principal.Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type ChatUser = {
    principal : Principal.Principal;
    name : Text;
  };

  public type UserData = {
    profile : UserProfile;
    dailyRecords : [DailyRecord];
    todayProblemCount : Nat;
    lastResetDate : Time.Time;
    lastChallengeCompletedDate : ?Time.Time;
    totalFine : Nat;
    creationDate : Time.Time;
  };

  type Badge = {
    #persistentRabbit;
    #dsaMasterCat;
    #legendaryScholar;
  };

  let userDataMap = Map.empty<Principal.Principal, UserData>();
  let chatMap = Map.empty<Text, [Message]>();
  let DAILY_GOAL : Nat = 5;
  let PENALTY_PER_PROBLEM : Nat = 20;
  let IST_OFFSET_NANOS : Int = 5 * 60 * 60 * 1_000_000_000 + 30 * 60 * 1_000_000_000;
  let RESET_HOUR_IST : Nat = 2;
  let timerInterval : Nat = 3_600_000_000_000;
  var timerId : Nat = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func getUserDataInternal(caller : Principal.Principal) : UserData {
    switch (userDataMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          totalProblemsSolved = 0;
          totalFine = 0;
          currentStreak = 0;
          badge = null;
        };
        let defaultData : UserData = {
          profile = defaultProfile;
          dailyRecords = [];
          todayProblemCount = 0;
          lastResetDate = Time.now();
          lastChallengeCompletedDate = null;
          totalFine = 0;
          creationDate = Time.now();
        };
        userDataMap.add(caller, defaultData);
        defaultData;
      };
      case (?userData) { userData };
    };
  };

  func calculateBadge(currentStreak : Nat) : ?Badge {
    if (currentStreak >= 21) { ?#legendaryScholar } else if (currentStreak >= 14) {
      ?#dsaMasterCat;
    } else if (currentStreak >= 7) { ?#persistentRabbit } else {
      null;
    };
  };

  func updateBadgeIfNeeded(profile : UserProfile) : UserProfile {
    let newBadge = calculateBadge(profile.currentStreak);
    { profile with badge = newBadge };
  };

  func isSameDay(date1 : Time.Time, date2 : Time.Time) : Bool {
    let d1 = date1 + IST_OFFSET_NANOS;
    let d2 = date2 + IST_OFFSET_NANOS;
    let day1 = d1 / (24 * 60 * 60 * 1_000_000_000);
    let day2 = d2 / (24 * 60 * 60 * 1_000_000_000);
    day1 == day2;
  };

  func isChallengeCompletedForDay(userData : UserData) : Bool {
    switch (userData.lastChallengeCompletedDate) {
      case (null) { false };
      case (?date) { isSameDay(date, Time.now()) };
    };
  };

  func shouldResetForUser(userData : UserData) : Bool {
    let now = Time.now();
    let lastResetIST = userData.lastResetDate + IST_OFFSET_NANOS;
    let nowIST = now + IST_OFFSET_NANOS;
    let lastResetDays = lastResetIST / (24 * 60 * 60 * 1_000_000_000);
    let nowDays = nowIST / (24 * 60 * 60 * 1_000_000_000);

    let creationDay = (userData.creationDate + IST_OFFSET_NANOS) / (24 * 60 * 60 * 1_000_000_000);

    if (nowDays == creationDay and nowDays > lastResetDays and lastResetIST >= nowDays * 24 * 60 * 60 * 1_000_000_000) {
      return false;
    };

    if (nowDays > lastResetDays) {
      let todayStartIST = nowDays * 24 * 60 * 60 * 1_000_000_000;
      let resetTimeToday = todayStartIST + Int.abs(RESET_HOUR_IST * 60 * 60 * 1_000_000_000);

      let isFirstDayWithPastReset = (nowDays == creationDay and userData.todayProblemCount == 0);
      if (isFirstDayWithPastReset) {
        return false;
      };

      return nowIST >= resetTimeToday;
    };

    false;
  };

  func processDailyResetForUser(_ : Principal.Principal, userData : UserData) : UserData {
    let record : DailyRecord = {
      date = userData.lastResetDate;
      problemsSolved = userData.todayProblemCount;
      penaltyApplied = if (userData.todayProblemCount < DAILY_GOAL) {
        (DAILY_GOAL - userData.todayProblemCount : Nat) * PENALTY_PER_PROBLEM;
      } else { 0 };
    };

    let newStreak = if (userData.todayProblemCount >= DAILY_GOAL) {
      userData.profile.currentStreak + 1;
    } else { 0 };

    let updatedProfile : UserProfile = updateBadgeIfNeeded({
      name = userData.profile.name;
      totalProblemsSolved = userData.profile.totalProblemsSolved + userData.todayProblemCount;
      totalFine = userData.profile.totalFine + record.penaltyApplied;
      currentStreak = newStreak;
      badge = userData.profile.badge;
    });

    {
      profile = updatedProfile;
      dailyRecords = userData.dailyRecords.concat([record]);
      todayProblemCount = 0;
      lastResetDate = Time.now();
      lastChallengeCompletedDate = userData.lastChallengeCompletedDate;
      totalFine = userData.totalFine + record.penaltyApplied;
      creationDate = userData.creationDate;
    };
  };

  func checkAndProcessDailyReset() : async () {
    for ((user, userData) in userDataMap.entries()) {
      if (shouldResetForUser(userData)) {
        let updatedData = processDailyResetForUser(user, userData);
        userDataMap.add(user, updatedData);
      };
    };
  };

  func calculateAdjustedLastResetDate() : Time.Time {
    let nowIST = Time.now() + IST_OFFSET_NANOS;
    let currentDayStart = (nowIST / (24 * 60 * 60 * 1_000_000_000)) * (24 * 60 * 60 * 1_000_000_000);

    if (nowIST >= currentDayStart + Int.abs(2 * 60 * 60 * 1_000_000_000)) {
      currentDayStart + Int.abs(2 * 60 * 60 * 1_000_000_000);
    } else { currentDayStart };
  };

  system func preupgrade() {};

  system func postupgrade() {
    timerId := Timer.recurringTimer(
      #nanoseconds(timerInterval),
      checkAndProcessDailyReset,
    );
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (userDataMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          totalProblemsSolved = 0;
          totalFine = 0;
          currentStreak = 0;
          badge = null;
        };
        defaultProfile;
      };
      case (?userData) { userData.profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal.Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (userDataMap.get(user)) {
      case (null) { null };
      case (?userData) { ?userData.profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let profileWithCorrectBadge = updateBadgeIfNeeded({
      name = profile.name;
      totalProblemsSolved = profile.totalProblemsSolved;
      totalFine = profile.totalFine;
      currentStreak = profile.currentStreak;
      badge = null;
    });

    switch (userDataMap.get(caller)) {
      case (null) {
        let newUserData : UserData = {
          profile = profileWithCorrectBadge;
          dailyRecords = [];
          todayProblemCount = 0;
          lastResetDate = Time.now();
          lastChallengeCompletedDate = null;
          totalFine = 0;
          creationDate = Time.now();
        };
        userDataMap.add(caller, newUserData);
      };
      case (?userData) {
        let updatedUserData = {
          userData with
          profile = profileWithCorrectBadge;
        };
        userDataMap.add(caller, updatedUserData);
      };
    };
  };

  public shared ({ caller }) func updateTodayProblems(count : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their problem count");
    };

    if (count > DAILY_GOAL) {
      Runtime.trap("Cannot set more than daily goal of 5 problems");
    };

    let userData = getUserDataInternal(caller);
    let needsReset = shouldResetForUser(userData);

    let finalUpdate = if (needsReset) {
      processDailyResetForUser(caller, userData);
    } else { userData };

    let updatedData = {
      finalUpdate with
      todayProblemCount = count;
    };
    userDataMap.add(caller, updatedData);

    if (count >= DAILY_GOAL) {
      let newUserData = {
        updatedData with
        lastChallengeCompletedDate = ?Time.now();
      };
      userDataMap.add(caller, newUserData);
    };
  };

  public query ({ caller }) func getTodayProblems() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their problem count");
    };

    switch (userDataMap.get(caller)) {
      case (null) { 0 };
      case (?userData) {
        if (shouldResetForUser(userData)) { 0 } else {
          userData.todayProblemCount;
        };
      };
    };
  };

  public query ({ caller }) func getDailyHistory() : async [DailyRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their history");
    };

    switch (userDataMap.get(caller)) {
      case (null) {
        userDataMap.add(caller, getUserDataInternal(caller));
        let newData = getUserDataInternal(caller);
        newData.dailyRecords;
      };
      case (?userData) { userData.dailyRecords };
    };
  };

  public query ({ caller }) func getUserDailyHistory(user : Principal.Principal) : async [DailyRecord] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own history");
    };

    switch (userDataMap.get(user)) {
      case (null) { [] };
      case (?userData) { userData.dailyRecords };
    };
  };

  public query ({ caller }) func getStats() : async {
    totalProblemsSolved : Nat;
    totalFine : Nat;
    currentStreak : Nat;
    todayProblems : Nat;
    badge : ?Badge;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their stats");
    };

    switch (userDataMap.get(caller)) {
      case (null) {
        {
          totalProblemsSolved = 0;
          totalFine = 0;
          currentStreak = 0;
          todayProblems = 0;
          badge = null;
        };
      };
      case (?userData) {
        {
          totalProblemsSolved = userData.profile.totalProblemsSolved;
          totalFine = userData.totalFine;
          currentStreak = userData.profile.currentStreak;
          todayProblems = if (shouldResetForUser(userData)) { 0 } else {
            userData.todayProblemCount;
          };
          badge = userData.profile.badge;
        };
      };
    };
  };

  func calculateCumulativeTotals(_ : [DailyRecord]) : Nat {
    var totalFine = 0;
    totalFine;
  };

  public query ({ caller }) func getAllUsers() : async [Principal.Principal] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userDataMap.keys().toArray();
  };

  public query ({ caller }) func getUserStats(user : Principal.Principal) : async ?{
    profile : UserProfile;
    todayProblems : Nat;
    recordCount : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view user stats");
    };

    switch (userDataMap.get(user)) {
      case (null) { null };
      case (?userData) {
        ?{
          profile = userData.profile;
          todayProblems = userData.todayProblemCount;
          recordCount = userData.dailyRecords.size();
        };
      };
    };
  };

  public shared ({ caller }) func triggerDailyReset() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can trigger reset");
    };
    await checkAndProcessDailyReset();
  };

  public query ({ caller }) func getAllUserStats() : async [{
    name : Text;
    totalProblemsSolved : Nat;
    totalFine : Nat;
    currentStreak : Nat;
    badge : ?Badge;
    dailyRecords : [DailyRecord];
  }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view leaderboard");
    };

    let userStats = userDataMap.toArray().map(
      func((_, userData)) {
        {
          name = userData.profile.name;
          totalProblemsSolved = userData.profile.totalProblemsSolved;
          totalFine = userData.totalFine;
          currentStreak = userData.profile.currentStreak;
          badge = userData.profile.badge;
          dailyRecords = userData.dailyRecords;
        };
      }
    );
    userStats;
  };

  public query ({ caller }) func getChat(receiver : Principal.Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access chat");
    };

    let key = generateChatKey(caller, receiver);

    switch (chatMap.get(key)) {
      case (null) { [] };
      case (?messages) { messages };
    };
  };

  public shared ({ caller }) func sendMessage(receiver : Principal.Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    if (caller == receiver) {
      Runtime.trap("Cannot send message to yourself");
    };

    switch (userDataMap.get(receiver)) {
      case (null) { Runtime.trap("Receiver does not exist") };
      case (?_) {};
    };

    let message : Message = {
      sender = caller;
      receiver;
      content;
      timestamp = Time.now();
    };

    let key = generateChatKey(caller, receiver);
    let newMessages = switch (chatMap.get(key)) {
      case (null) { [message] };
      case (?existingMessages) {
        let messagesList = List.fromArray<Message>(existingMessages);
        messagesList.add(message);
        messagesList.toArray();
      };
    };

    chatMap.add(key, newMessages);
  };

  func generateChatKey(user1 : Principal.Principal, user2 : Principal.Principal) : Text {
    let user1Text = user1.toText();
    let user2Text = user2.toText();
    if (user1Text < user2Text) { user1Text # "-" # user2Text } else {
      user2Text # "-" # user1Text;
    };
  };

  public query ({ caller }) func getChatUsers() : async [ChatUser] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view chat users");
    };

    userDataMap.toArray().filter(
      func((principal, _)) {
        principal != caller;
      }
    ).map(
      func((principal, userData)) {
        {
          principal = principal;
          name = userData.profile.name;
        };
      }
    );
  };

  public shared ({ caller }) func setTodayProblemsForUser(user : Principal.Principal, count : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can set problems for others");
    };

    if (count > DAILY_GOAL) {
      Runtime.trap("Cannot set more than daily goal of 5 problems");
    };

    let userData = getUserDataInternal(user);
    let needsReset = shouldResetForUser(userData);

    let finalUpdate = if (needsReset) {
      processDailyResetForUser(user, userData);
    } else { userData };

    let updatedData = {
      finalUpdate with
      todayProblemCount = count;
    };
    userDataMap.add(user, updatedData);
  };

  public shared ({ caller }) func resetAllUserData() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reset user data");
    };

    userDataMap.clear();
    chatMap.clear();
  };

  public shared ({ caller }) func createUserProfileIfMissing(name : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    switch (userDataMap.get(caller)) {
      case (null) {
        let newUserProfile : UserProfile = {
          name;
          totalProblemsSolved = 0;
          totalFine = 0;
          currentStreak = 0;
          badge = null;
        };

        let newUserData : UserData = {
          profile = newUserProfile;
          dailyRecords = [];
          todayProblemCount = 0;
          lastResetDate = calculateAdjustedLastResetDate();
          lastChallengeCompletedDate = null;
          totalFine = 0;
          creationDate = Time.now();
        };

        userDataMap.add(caller, newUserData);
        "Account created successfully";
      };
      case (?_) { "Account already exists" };
    };
  };

  public query ({ caller }) func verifyAccountExists() : async {
    exists : Bool;
    accountCreated : Bool;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can verify accounts");
    };

    {
      exists = userDataMap.containsKey(caller);
      accountCreated = userDataMap.containsKey(caller);
    };
  };

  public query ({ caller }) func isDailyChallengeCompleted() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check challenge status");
    };

    switch (userDataMap.get(caller)) {
      case (null) { false };
      case (?userData) {
        isChallengeCompletedForDay(userData);
      };
    };
  };

  public query ({ caller }) func getUserLifetimeStats(user : Principal.Principal) : async {
    totalProblemsSolved : Nat;
    totalFine : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view global stats");
    };

    switch (userDataMap.get(user)) {
      case (null) { { totalProblemsSolved = 0; totalFine = 0 } };
      case (?userData) {
        {
          totalProblemsSolved = userData.profile.totalProblemsSolved;
          totalFine = userData.totalFine;
        };
      };
    };
  };

  public query ({ caller }) func getAllLifetimeStats() : async [{
    name : Text;
    totalProblemsSolved : Nat;
    totalFine : Nat;
    currentStreak : Nat;
    badge : ?Badge;
  }] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view global stats");
    };

    userDataMap.toArray().map(
      func((_, userData)) {
        {
          name = userData.profile.name;
          totalProblemsSolved = userData.profile.totalProblemsSolved;
          totalFine = userData.totalFine;
          currentStreak = userData.profile.currentStreak;
          badge = userData.profile.badge;
        };
      }
    );
  };

  public shared ({ caller }) func updateYesterdayData() : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update yesterday's data");
    };

    var updatedUserCount = 0;
    var totalRecordsChanged = 0;

    for ((user, oldUserData) in userDataMap.entries()) {
      if (oldUserData.dailyRecords.size() > 0) {
        let newData = processRetrospectiveReset(user, oldUserData, true);
        let lastRecord = switch (newData.dailyRecords.reverse().values().next()) {
          case (null) { null };
          case (?record) { ?record };
        };

        if (lastRecord != null and not areOptionalDailyRecordsEqual(lastRecord, switch (oldUserData.dailyRecords.reverse().values().next()) {
          case (null) { null };
          case (?record) { ?record };
        })) {
          updatedUserCount += 1;
          totalRecordsChanged += 1;
        };

        userDataMap.add(user, newData);
      } else {
        userDataMap.add(user, processRetrospectiveReset(user, oldUserData, true));
      };
    };

    "Processed all users (" # updatedUserCount.toText() # " with previous record). Total changes applied: " # totalRecordsChanged.toText() # ".";
  };

  func areOptionalDailyRecordsEqual(opt1 : ?DailyRecord, opt2 : ?DailyRecord) : Bool {
    switch (opt1, opt2) {
      case (null, null) { true };
      case (null, ?_) { false };
      case (?_, null) { false };
      case (?record1, ?record2) {
        (record1.date == record2.date) and (record1.problemsSolved == record2.problemsSolved) and (record1.penaltyApplied == record2.penaltyApplied);
      };
    };
  };

  func processRetrospectiveReset(_ : Principal.Principal, userData : UserData, retroactive : Bool) : UserData {
    let record : DailyRecord = {
      date = switch (userData.dailyRecords.reverse().values().next()) {
        case (null) { userData.lastResetDate };
        case (?latestRecord) { latestRecord.date };
      };
      problemsSolved = userData.todayProblemCount;
      penaltyApplied = if (userData.todayProblemCount < DAILY_GOAL and not retroactive) {
        (DAILY_GOAL - userData.todayProblemCount : Nat) * PENALTY_PER_PROBLEM;
      } else { 0 };
    };

    let newStreak = if (userData.todayProblemCount >= DAILY_GOAL) {
      userData.profile.currentStreak + 1;
    } else { 0 };

    let updatedProfile : UserProfile = updateBadgeIfNeeded({
      name = userData.profile.name;
      totalProblemsSolved = userData.profile.totalProblemsSolved + userData.todayProblemCount;
      totalFine = if (retroactive) {
        userData.profile.totalFine + record.penaltyApplied;
      } else {
        userData.profile.totalFine;
      };
      currentStreak = newStreak;
      badge = userData.profile.badge;
    });

    let updatedDailyReviewArray = userData.dailyRecords.concat([record]);

    {
      profile = updatedProfile;
      dailyRecords = updatedDailyReviewArray;
      todayProblemCount = if (retroactive) { 0 } else { userData.todayProblemCount };
      lastResetDate = if (retroactive) { userData.lastResetDate } else { Time.now() };
      lastChallengeCompletedDate = userData.lastChallengeCompletedDate;
      totalFine = 0;
      creationDate = userData.creationDate;
    };
  };
};
