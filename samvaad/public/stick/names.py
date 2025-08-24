"""
samvaad Custom Sticker Generator
==============================

This Python script automatically generates a JSON file containing all image filenames
from the stick folder. The generated images.json file is used by the samvaad application
to provide custom stickers in the chat interface.

Purpose:
- Scans the stick/ folder for PNG and WebP image files
- Creates images.json with a list of all available sticker images
- Enables users to send custom stickers from the sticker collection
- Automates sticker management for the samvaad video chat application

IMPORTANT: Naming Convention for Searchable Stickers
==================================================
For better search functionality, name your sticker files descriptively:
- ✅ GOOD: "please.png", "sad3demoji.webp", "shockemoji.webp", "sleepemoji.webp"
- ❌ AVOID: "1.png", "2.png", "3.png", "image1.webp"

Search-friendly names help users find stickers quickly by typing:
- "please" → finds "please.png" and "please.webp"
- "sad" → finds "sad3demoji.webp" and other sad stickers
- "shock" → finds "shockemoji.webp", "shockfac.png", "shockface.png"
- "sleep" → finds "sleepemoji.webp"

Usage:
- Run this script to update the sticker collection
- The generated images.json is automatically loaded by the frontend
- Users can access stickers via the 🎬 button in the chat interface
- Users can search stickers by typing descriptive keywords

File Structure:
stick/
├── names.py          # This script
├── images.json       # Generated sticker list (auto-created)
└── sticker/           # Folder containing all sticker images
    ├── please.png
    ├── sad3demoji.webp
    ├── shockemoji.webp
    ├── sleepemoji.webp
    ├── angryemoji.webp
    ├── happyemoji.webp
    └── ... (other descriptive sticker names)
"""

import os
import json

def generate_images_json(directory, output_file):
    """
    Generate a JSON file containing all image filenames from the specified directory.
    
    Args:
        directory (str): Name of the directory containing sticker images
        output_file (str): Name of the output JSON file to create
    
    This function:
    1. Scans the sticker/ subdirectory for PNG and WebP files
    2. Filters out non-image files
    3. Creates a JSON array with all image filenames
    4. Saves the result to images.json in the same folder as this script
    """
    # Get the current directory (where this script is located)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the full path to the "stick" folder (subdirectory)
    stick_dir = os.path.join(current_dir, directory)
    
    # Check if the "stick" folder exists
    if not os.path.exists(stick_dir):
        print(f"Error: '{directory}' folder not found at: {stick_dir}")
        return
    
    # List all files in the specified directory
    files = os.listdir(stick_dir)
    
    # Filter only PNG and WebP files (supported sticker formats)
    images = [file for file in files if file.endswith('.png') or file.endswith('.webp')]
    
    # Create the full path for the output file (in the same folder as this script)
    output_path = os.path.join(current_dir, output_file)
    
    # Write the list of image filenames to the output JSON file
    # This JSON file is loaded by the frontend to display available stickers
    with open(output_path, 'w') as f:
        json.dump(images, f, indent=4)
    
    print(f"📁 Scanned directory: {stick_dir}")
    print(f"📄 Created images.json at: {output_path}")

if __name__ == "__main__":
    # Configuration: Directory containing images and output file name
    directory = 'sticker'  # Directory containing images (relative to this script)
    output_file = 'images.json'  # Output JSON file for the frontend to read
    
    print("🔍 samvaad Sticker Generator Starting...")
    print(f"📁 Script location: {os.path.dirname(os.path.abspath(__file__))}")
    print(f"🎯 Target directory: {os.path.join(os.path.dirname(os.path.abspath(__file__)), directory)}")
    print(f"📄 Output file: {os.path.join(os.path.dirname(os.path.abspath(__file__)), output_file)}")
    print("-" * 50)
    
    # Generate the sticker list and save to images.json
    generate_images_json(directory, output_file)
    
    # Count images using the same path logic as the function
    current_dir = os.path.dirname(os.path.abspath(__file__))
    stick_dir = os.path.join(current_dir, directory)
    
    if os.path.exists(stick_dir):
        image_count = len([f for f in os.listdir(stick_dir) if f.endswith(('.png', '.webp'))])
        print(f"✅ Sticker collection updated! {image_count} images found in '{directory}' folder.")
        print(f"📊 Total files in '{directory}' folder: {len(os.listdir(stick_dir))}")
    else:
        print("⚠️  Warning: Could not count images - directory not found.")
    
    print("🎯 The samvaad app will now use these custom stickers in the chat interface.")
