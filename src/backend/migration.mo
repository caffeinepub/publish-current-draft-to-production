import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type OldUserProfile = {
    name : Text;
    totalProblemsSolved : Nat;
    totalFine : Nat;
    currentStreak : Nat;
    badge : ?Badge;
  };

  type OldDailyRecord = {
    date : Time.Time;
    problemsSolved : Nat;
    penaltyApplied : Nat;
  };

  type OldUserData = {
    profile : OldUserProfile;
    dailyRecords : [OldDailyRecord];
    todayProblemCount : Nat;
    lastResetDate : Time.Time;
    lastChallengeCompletedDate : ?Time.Time;
    totalFine : Nat;
    creationDate : Time.Time;
  };

  type NewUserProfile = {
    name : Text;
    totalQuestionsSolved : Nat;
    totalFine : Nat;
    currentStreak : Nat;
    badge : ?Badge;
  };

  type NewDailyRecord = {
    date : Time.Time;
    questionsSolved : Nat;
    penaltyApplied : Nat;
  };

  type NewUserData = {
    profile : NewUserProfile;
    dailyRecords : [NewDailyRecord];
    todayQuestionsCount : Nat;
    lastDailyResetDate : Time.Time;
    lastChallengeCompletedDate : ?Time.Time;
    totalFine : Nat;
    creationDate : Time.Time;
    highestDailyQuestions : Nat;
  };

  type Badge = {
    #persistentRabbit;
    #dsaMasterCat;
    #legendaryScholar;
  };

  type OldActor = {
    userDataMap : Map.Map<Principal.Principal, OldUserData>;
    DAILY_GOAL : Nat;
  };

  type NewActor = {
    userDataMap : Map.Map<Principal.Principal, NewUserData>;
    PENALTY_EXCEPTIONAL_LIMIT : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newUserDataMap = old.userDataMap.map<Principal.Principal, OldUserData, NewUserData>(
      func(_, oldData) {
        let newProfile = {
          name = oldData.profile.name;
          totalQuestionsSolved = oldData.profile.totalProblemsSolved;
          totalFine = oldData.profile.totalFine;
          currentStreak = oldData.profile.currentStreak;
          badge = oldData.profile.badge;
        };

        let newDailyRecords = oldData.dailyRecords.map(
          func(record) {
            {
              date = record.date;
              questionsSolved = record.problemsSolved;
              penaltyApplied = record.penaltyApplied;
            };
          }
        );

        {
          profile = newProfile;
          dailyRecords = newDailyRecords;
          todayQuestionsCount = oldData.todayProblemCount;
          lastDailyResetDate = oldData.lastResetDate;
          lastChallengeCompletedDate = oldData.lastChallengeCompletedDate;
          totalFine = oldData.totalFine;
          creationDate = oldData.creationDate;
          highestDailyQuestions = if (oldData.todayProblemCount > 0) { oldData.todayProblemCount } else {
            0;
          };
        };
      }
    );
    {
      userDataMap = newUserDataMap;
      PENALTY_EXCEPTIONAL_LIMIT = 1;
    };
  };
};
