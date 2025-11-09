/// Native notification system for Linux
/// Uses libnotify (via notify-rust crate) for D-Bus notifications

#[cfg(target_os = "linux")]
use notify_rust::{Notification, Timeout, Urgency};

/// Notification urgency levels
#[derive(Debug, Clone)]
pub enum NotificationUrgency {
    Low,
    Normal,
    Critical,
}

/// Show a native Linux notification
#[cfg(target_os = "linux")]
pub fn show_native_notification(
    title: &str,
    body: &str,
    urgency: NotificationUrgency,
) -> Result<(), Box<dyn std::error::Error>> {
    let urgency_level = match urgency {
        NotificationUrgency::Low => Urgency::Low,
        NotificationUrgency::Normal => Urgency::Normal,
        NotificationUrgency::Critical => Urgency::Critical,
    };

    Notification::new()
        .summary(title)
        .body(body)
        .icon("dialog-information")
        .appname("OverLearn")
        .urgency(urgency_level)
        .timeout(Timeout::Milliseconds(5000)) // 5 seconds
        .show()?;

    Ok(())
}

/// Show notification for Pomodoro timer completion
#[cfg(target_os = "linux")]
pub fn show_pomodoro_notification(session_type: &str, duration: i32) -> Result<(), Box<dyn std::error::Error>> {
    match session_type {
        "work" => {
            show_native_notification(
                "🎯 Work Session Complete!",
                &format!("You completed a {}-minute work session! Time to take a break. ☕", duration),
                NotificationUrgency::Normal,
            )
        }
        "break" => {
            show_native_notification(
                "⏰ Break Complete!",
                "Break's over! Ready to focus again? Let's get back to work! 💪",
                NotificationUrgency::Normal,
            )
        }
        _ => {
            show_native_notification(
                "⏱️ Timer Complete",
                &format!("Your {}-minute session is complete!", duration),
                NotificationUrgency::Normal,
            )
        }
    }
}

/// Show notification for study goal milestone
#[cfg(target_os = "linux")]
pub fn show_study_goal_notification(
    goal_title: &str,
    milestone: i32,
) -> Result<(), Box<dyn std::error::Error>> {
    let (emoji, message) = match milestone {
        25 => ("🌱", format!("You're 25% through \"{}\"! Keep going!", goal_title)),
        50 => ("🚀", format!("Halfway there on \"{}\"!", goal_title)),
        75 => ("⭐", format!("Almost done with \"{}\"!", goal_title)),
        100 => ("🎉", format!("Congratulations! You completed \"{}\"!", goal_title)),
        _ => ("📊", format!("You're {}% through \"{}\"!", milestone, goal_title)),
    };

    show_native_notification(
        &format!("{} Study Goal Milestone: {}%", emoji, milestone),
        &message,
        NotificationUrgency::Normal,
    )
}

/// Placeholder for non-Linux platforms
#[cfg(not(target_os = "linux"))]
pub fn show_native_notification(
    title: &str,
    body: &str,
    _urgency: NotificationUrgency,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("📢 Notification: {} - {}", title, body);
    Ok(())
}

#[cfg(not(target_os = "linux"))]
pub fn show_pomodoro_notification(_session_type: &str, _duration: i32) -> Result<(), Box<dyn std::error::Error>> {
    println!("📢 Pomodoro notification (not implemented for this platform)");
    Ok(())
}

#[cfg(not(target_os = "linux"))]
pub fn show_study_goal_notification(
    _goal_title: &str,
    _milestone: i32,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("📢 Study goal notification (not implemented for this platform)");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(target_os = "linux")]
    fn test_notification_creation() {
        // This test requires a D-Bus session, so it might fail in CI
        let result = show_native_notification(
            "Test Notification",
            "This is a test",
            NotificationUrgency::Normal,
        );

        // We don't assert here because it requires a running D-Bus session
        println!("Test result: {:?}", result);
    }
}
