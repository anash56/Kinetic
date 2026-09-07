-- Keep one completion per valid frequency period for every user's habits.
DELETE FROM "HabitCompletion" AS completion
WHERE completion."id" IN (
  SELECT duplicate."id"
  FROM (
    SELECT
      "HabitCompletion"."id",
      ROW_NUMBER() OVER (
        PARTITION BY "HabitCompletion"."habitId",
          CASE "Habit"."frequency"
            WHEN 'DAILY' THEN "HabitCompletion"."completedOn"::timestamp
            WHEN 'WEEKLY' THEN DATE_TRUNC('week', "HabitCompletion"."completedOn"::timestamp)
            WHEN 'MONTHLY' THEN DATE_TRUNC('month', "HabitCompletion"."completedOn"::timestamp)
          END
        ORDER BY "HabitCompletion"."completedOn" ASC, "HabitCompletion"."id" ASC
      ) AS row_number
    FROM "HabitCompletion"
    INNER JOIN "Habit" ON "Habit"."id" = "HabitCompletion"."habitId"
  ) AS duplicate
  WHERE duplicate.row_number > 1
);