-- Add indexes for user-scoped lists, date-based reporting, and admin ordering.
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX "IncomeSource_userId_createdAt_idx" ON "IncomeSource"("userId", "createdAt");
CREATE INDEX "Habit_userId_createdAt_idx" ON "Habit"("userId", "createdAt");
CREATE INDEX "Goal_userId_createdAt_idx" ON "Goal"("userId", "createdAt");
CREATE INDEX "Asset_userId_updatedAt_idx" ON "Asset"("userId", "updatedAt");
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");
CREATE INDEX "Feedback_userId_createdAt_idx" ON "Feedback"("userId", "createdAt");