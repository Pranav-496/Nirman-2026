import sys
import os
import hashlib
import json

def add_document(file_path):
    if not os.path.exists(file_path):
        print(f"Error: Path '{file_path}' not found.")
        return

    # If it's a directory, process all files inside (except json)
    if os.path.isdir(file_path):
        count = 0
        for item in os.listdir(file_path):
            if item.endswith(".json"): continue
            
            full_path = os.path.join(file_path, item)
            if os.path.isfile(full_path):
                _process_single_file(full_path)
                count += 1
        print(f"\nFinished processing {count} files in directory.")
    else:
        _process_single_file(file_path)

def _process_single_file(file_path):
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    file_hash = hashlib.sha256(file_bytes).hexdigest()
    
    auth_file_path = os.path.join(os.path.dirname(__file__), "data", "authorized_files.json")
    
    if os.path.exists(auth_file_path):
        with open(auth_file_path, "r") as f:
            try:
                auth_hashes = json.load(f)
            except json.JSONDecodeError:
                auth_hashes = []
    else:
        auth_hashes = []

    if file_hash not in auth_hashes:
        auth_hashes.append(file_hash)
        with open(auth_file_path, "w") as f:
            json.dump(auth_hashes, f, indent=2)
        print(f"Added: '{os.path.basename(file_path)}' -> {file_hash[:8]}...")
    else:
        print(f"Skipped: '{os.path.basename(file_path)}' (Already authorized)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_authorized_document.py <path_to_pdf_or_image_or_folder>")
        sys.exit(1)
    
    add_document(sys.argv[1])
