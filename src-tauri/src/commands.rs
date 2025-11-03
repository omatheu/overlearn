use tauri::{AppHandle, Manager};

/// Simple greeting command for testing Tauri IPC
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to OverLearn.", name)
}

/// Show a system notification
#[tauri::command]
pub async fn show_notification(
    app: AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;

    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Get application version
#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Show a native notification (Linux libnotify)
#[tauri::command]
pub fn show_native_notification(
    title: String,
    message: String,
    urgency: String,
) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        use crate::notifications::{show_native_notification as show_linux_notification, NotificationUrgency};

        let urgency_level = match urgency.as_str() {
            "low" => NotificationUrgency::Low,
            "critical" => NotificationUrgency::Critical,
            _ => NotificationUrgency::Normal,
        };

        show_linux_notification(&title, &message, urgency_level)
            .map_err(|e| e.to_string())?;
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!("Native notification: {} - {}", title, message);
    }

    Ok(())
}

/// Show Pomodoro completion notification
#[tauri::command]
pub fn notify_pomodoro_complete(
    session_type: String,
    duration: i32,
    task_title: Option<String>,
) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        use crate::notifications::show_pomodoro_notification;

        show_pomodoro_notification(&session_type, duration)
            .map_err(|e| e.to_string())?;
    }

    #[cfg(not(target_os = "linux"))]
    {
        let task_info = task_title.unwrap_or_else(|| "no task".to_string());
        println!(
            "Pomodoro notification: {} session ({} min) - {}",
            session_type, duration, task_info
        );
    }

    Ok(())
}

/// Show study goal milestone notification
#[tauri::command]
pub fn notify_study_goal_milestone(
    goal_title: String,
    milestone: i32,
) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        use crate::notifications::show_study_goal_notification;

        show_study_goal_notification(&goal_title, milestone)
            .map_err(|e| e.to_string())?;
    }

    #[cfg(not(target_os = "linux"))]
    {
        println!(
            "Study goal notification: {}% milestone for '{}'",
            milestone, goal_title
        );
    }

    Ok(())
}

/// Open DevTools (development only)
#[tauri::command]
pub fn open_dev_tools(app: AppHandle) {
    #[cfg(debug_assertions)]
    {
        if let Some(window) = app.get_webview_window("main") {
            window.open_devtools();
        }
    }

    #[cfg(not(debug_assertions))]
    {
        let _ = app;
        println!("DevTools are only available in debug mode");
    }
}
