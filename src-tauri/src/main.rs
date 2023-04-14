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

use std::fs::File;
use std::io;
use zip::ZipArchive;

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

    match result {
        Ok(path) => Ok(path),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn get_core_count() -> Result<u32, String> {
    Ok(num_cpus::get() as u32)
}

fn extract_files(
    zip_path: &str,
    files_to_extract: &[&str],
    output_paths: &[&str],
) -> Result<(), Box<dyn std::error::Error>> {
    // Open the zip archive
    let reader = File::open(zip_path)?;
    let mut archive = ZipArchive::new(reader)?;

    let mut file_indices = Vec::new();

    // Find the files in the folders of the archive
    // e.g. given the input "ffmpeg.exe" it should find "ffmpeg-6.0-essentials_build/bin/ffmpeg.exe"
    for file_to_extract in files_to_extract {
        let file_index = (0..archive.len())
            .find(|&index| {
                let file = archive.by_index(index).unwrap();
                file.name().ends_with(file_to_extract)
            })
            .expect("Failed to find file in archive");

        file_indices.push(file_index);
    }

    // Split archive into two separate variables for immutable and mutable borrow
    let mut output_files = Vec::new();
    for output_path in output_paths {
        let output_file = File::create(output_path)?;
        output_files.push(output_file);
    }

    // Copy the file contents
    for (i, file_index) in file_indices.iter().enumerate() {
        let mut file_in_archive = archive.by_index(*file_index)?;
        io::copy(&mut file_in_archive, &mut output_files[i])?;
    }

    Ok(())
}

#[tauri::command]
async fn tauri_extract_files(
    zip_path: String,
    files_to_extract: Vec<String>,
    output_paths: Vec<String>,
) -> Result<Vec<String>, String> {
    let files_to_extract: Vec<&str> = files_to_extract.iter().map(|s| s.as_str()).collect();
    let output_paths: Vec<&str> = output_paths.iter().map(|s| s.as_str()).collect();

    let result = extract_files(&zip_path, &files_to_extract, &output_paths);

    match result {
        Ok(()) => {
            let output_paths_string: Vec<String> =
                output_paths.iter().map(|s| s.to_string()).collect();
            Ok(output_paths_string)
        }
        Err(err) => Err(err.to_string()),
    }
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
        .invoke_handler(tauri::generate_handler![
            get_core_count,
            download_command,
            tauri_extract_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
