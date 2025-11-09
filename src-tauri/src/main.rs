// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod notifications;
mod tray;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Setup system tray
            tray::setup_tray(app)?;

            // Log startup
            println!("🚀 OverLearn desktop app started");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::show_notification,
            commands::show_native_notification,
            commands::notify_pomodoro_complete,
            commands::notify_study_goal_milestone,
            commands::get_app_version,
            commands::open_dev_tools,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
