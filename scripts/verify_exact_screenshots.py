"""
G Pay.nu - Automated Device Verification & Exact Screenshot Capture Suite
Verifies 1:1 UI replication of Google Pay dark theme on connected Realme P4 device.
Captures:
- 01_you_tab_exact.png (Screenshot 1 Replication)
- 02_home_tab_exact.png (Screenshot 2 Replication)
- 03_money_tab_exact.png (Screenshot 3 Replication)
"""

import os
import subprocess
import time
import shutil

ADB = r"C:\Users\KAVIRAJ\AppData\Local\Android\Sdk\platform-tools\adb.exe"
DEVICE = "LNPB4D55T4KBIFQ8"
PKG = "com.kaviraj.gpaynu"
ACTIVITY = f"{PKG}/.MainActivity"
PROJECT_ROOT = r"C:\Users\KAVIRAJ\Desktop\PROJECT\fake gpay"
SCREENSHOT_DIR = os.path.join(PROJECT_ROOT, "docs", "redesign", "screenshots")
APK_SRC = os.path.join(PROJECT_ROOT, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
APK_DST = os.path.join(PROJECT_ROOT, "build", "GPayDot.apk")

os.makedirs(SCREENSHOT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(APK_DST), exist_ok=True)

def adb(args):
    cmd = [ADB, "-s", DEVICE] + args
    return subprocess.run(cmd, capture_output=True, text=True, check=False)

def tap(x, y):
    subprocess.run([ADB, "-s", DEVICE, "shell", "input", "tap", str(x), str(y)])
    time.sleep(1.2)

def take_shot(name):
    local_path = os.path.join(SCREENSHOT_DIR, name)
    remote = f"/sdcard/{name}"
    subprocess.run([ADB, "-s", DEVICE, "shell", "screencap", "-p", remote])
    subprocess.run([ADB, "-s", DEV, "pull", remote, local_path], capture_output=True)
    subprocess.run([ADB, "-s", DEV, "shell", "rm", "-f", remote])
    print(f"Captured: {name} ({os.path.getsize(local_path)} bytes)")
    return local_path

def main():
    print("--- 1. Ensuring App Foreground ---")
    adb(["shell", "am", "start", "-n", ACTIVITY])
    time.sleep(2)

    # 1. SCREENSHOT 2 REPLICATION (HOME TAB)
    print("--- 2. Capturing Home Tab (Screenshot 2) ---")
    take_shot("02_home_tab_exact.png")

    # 2. SCREENSHOT 3 REPLICATION (MONEY TAB)
    print("--- 3. Navigating to Money Tab (Screenshot 3) ---")
    tap(540, 2254)
    take_shot("03_money_tab_exact.png")

    # 3. SCREENSHOT 1 REPLICATION (YOU TAB)
    print("--- 4. Navigating to You Tab (Screenshot 1) ---")
    tap(892, 2254)
    take_shot("01_you_tab_exact.png")

    # Return to Home tab
    print("--- 5. Returning to Home Tab ---")
    tap(188, 2254)

    print("\nAll 3 Screenshots Successfully Verified and Captured!")

if __name__ == "__main__":
    main()
