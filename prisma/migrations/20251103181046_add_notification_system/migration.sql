-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'system',
    "scheduledFor" DATETIME,
    "sentAt" DATETIME,
    "studyGoalId" TEXT,
    "taskId" TEXT,
    "userProfileId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_studyGoalId_fkey" FOREIGN KEY ("studyGoalId") REFERENCES "StudyGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pomodoroEnabled" BOOLEAN NOT NULL DEFAULT true,
    "studyGoalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "taskDeadlineEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "userProfileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationPreferences_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Notification_userProfileId_idx" ON "Notification"("userProfileId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_scheduledFor_idx" ON "Notification"("scheduledFor");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userProfileId_key" ON "NotificationPreferences"("userProfileId");

-- CreateIndex
CREATE INDEX "Flashcard_nextReview_idx" ON "Flashcard"("nextReview");

-- CreateIndex
CREATE INDEX "Flashcard_taskId_idx" ON "Flashcard"("taskId");

-- CreateIndex
CREATE INDEX "Flashcard_conceptId_idx" ON "Flashcard"("conceptId");

-- CreateIndex
CREATE INDEX "Flashcard_easeFactor_idx" ON "Flashcard"("easeFactor");

-- CreateIndex
CREATE INDEX "StudySession_createdAt_idx" ON "StudySession"("createdAt");

-- CreateIndex
CREATE INDEX "StudySession_type_idx" ON "StudySession"("type");

-- CreateIndex
CREATE INDEX "StudySession_userProfileId_idx" ON "StudySession"("userProfileId");

-- CreateIndex
CREATE INDEX "StudySession_taskId_idx" ON "StudySession"("taskId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_scheduledDate_idx" ON "Task"("scheduledDate");

-- CreateIndex
CREATE INDEX "Task_userProfileId_idx" ON "Task"("userProfileId");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_type_idx" ON "Task"("type");
