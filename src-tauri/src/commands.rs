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
