// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#![allow(unused_imports, unused_variables)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use reqwest::Error;
use tauri::Manager;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

async fn download_file(url: String, path: &str) -> Result<String, Error> {
    let client = reqwest::Client::new();
    let response = client.get(&url).send().await?;
    let bytes = response.bytes().await?;
    let mut file = std::fs::File::create(path).unwrap();
    std::io::Write::write_all(&mut file, &bytes).unwrap();

    // return the path on success
    Ok(path.to_string())
}

#[tauri::command]
async fn download_command(url: String, path: String) -> Result<String, String> {
    let result = download_file(url, &path).await;
    println!("{:?}", result);

    // return the error as a string
    match result {
        Ok(path) => Ok(path),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn get_core_count() -> Result<u32, String> {
    Ok(num_cpus::get() as u32)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_blur(&window, Some((18, 18, 18, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_core_count, download_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
