use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager, Result,
};

/// Setup system tray icon and menu
pub fn setup_tray(app: &App) -> Result<()> {
    // Build tray menu
    let quit = MenuItemBuilder::with_id("quit", "Quit OverLearn").build(app)?;
    let show = MenuItemBuilder::with_id("show", "Show Window").build(app)?;
    let hide = MenuItemBuilder::with_id("hide", "Hide Window").build(app)?;
    let separator = tauri::menu::PredefinedMenuItem::separator(app)?;

    let menu = MenuBuilder::new(app)
        .item(&show)
        .item(&hide)
        .item(&separator)
        .item(&quit)
        .build()?;

    // Load tray icon (you'll need to provide an icon file)
    let icon = load_tray_icon()?;

    // Build tray icon
    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .tooltip("OverLearn")
        .on_menu_event(|app, event| match event.id().as_ref() {
            "quit" => {
                println!("Quit menu item clicked");
                app.exit(0);
            }
            "show" => {
                println!("Show menu item clicked");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "hide" => {
                println!("Hide menu item clicked");
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            _ => {
                println!("Unknown menu item: {}", event.id().as_ref());
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    println!("✅ System tray initialized");

    Ok(())
}

/// Load tray icon from embedded resources or create a simple one
fn load_tray_icon() -> Result<Image<'static>> {
    // Fallback: create a simple 32x32 PNG icon
    // This is a minimal valid PNG (transparent 32x32)
    const MINIMAL_PNG: &[u8] = &[
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x20, // 32x32
        0x08, 0x06, 0x00, 0x00, 0x00, 0x73, 0x7A, 0x7A, // RGBA, no compression
        0xF4, 0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, // sRGB chunk
        0x42, 0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00, // ...
        0x00, 0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, // gAMA chunk
        0xB1, 0x8F, 0x0B, 0xFC, 0x61, 0x05, 0x00, 0x00, // ...
        0x00, 0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, // pHYs chunk
        0x0E, 0xC3, 0x00, 0x00, 0x0E, 0xC3, 0x01, 0xC7, // ...
        0x6F, 0xA8, 0x64, 0x00, 0x00, 0x00, 0x0C, 0x49, // IDAT chunk (minimal data)
        0x44, 0x41, 0x54, 0x68, 0x81, 0x63, 0x00, 0x01,
        0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D,
        0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
        0x44, 0xAE, 0x42, 0x60, 0x82,
    ];

    // Try to load from file first
    let icon_path = "icons/icon.png";
    if let Ok(icon_bytes) = std::fs::read(icon_path) {
        return Image::from_bytes(&icon_bytes);
    }

    // Use fallback icon
    Image::from_bytes(MINIMAL_PNG)
}
