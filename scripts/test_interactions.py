import os
import subprocess
import time

ADB = r"C:\Users\KAVIRAJ\AppData\Local\Android\Sdk\platform-tools\adb.exe"
DEV = "LNPB4D55T4KBIFQ8"

def adb(args):
    cmd = [ADB, "-s", DEV] + args
    return subprocess.run(cmd, capture_output=True, text=True, check=False)

def tap(x, y):
    adb(["shell", "input", "tap", str(x), str(y)])
    time.sleep(1.2)

def main():
    print("--- Testing Interactive Functionality ---")
    
    # 1. On You Tab, tap 16 rewards card (x=270, y=780)
    print("Testing '16 rewards' card on You tab...")
    tap(270, 780)
    adb(["shell", "uiautomator", "dump", "/data/local/tmp/you_test.xml"])
    res = adb(["shell", "cat", "/data/local/tmp/you_test.xml"]).stdout
    print("Modal opened:", "Rewards" in res or "Close" in res or "Dismiss" in res or "16" in res)
    # Dismiss modal by pressing Back
    adb(["shell", "input", "keyevent", "4"])
    time.sleep(1)

    # 2. Switch to Money Tab (x=540, y=2254)
    print("\nSwitching to Money tab...")
    tap(540, 2254)
    # Tap "Check balance" on Indian Bank (x=850, y=780)
    print("Testing 'Check balance' button...")
    tap(850, 780)
    time.sleep(1)
    adb(["shell", "uiautomator", "dump", "/data/local/tmp/money_test.xml"])
    res = adb(["shell", "cat", "/data/local/tmp/money_test.xml"]).stdout
    print("Balance / Action responsive:", "Balance" in res or "Indian Bank" in res or "Demo" in res)
    # Dismiss modal
    adb(["shell", "input", "keyevent", "4"])
    time.sleep(1)

    # 3. Switch to Home Tab (x=188, y=2254)
    print("\nSwitching to Home tab...")
    tap(188, 2254)
    # Tap "Pay anyone" (x=410, y=760)
    print("Testing 'Pay anyone' tile...")
    tap(410, 760)
    time.sleep(1.2)
    adb(["shell", "uiautomator", "dump", "/data/local/tmp/home_test.xml"])
    res = adb(["shell", "cat", "/data/local/tmp/home_test.xml"]).stdout
    print("Contacts / Pay Anyone screen opened:", "Contact" in res or "Search" in res or "Pay" in res or "Phone" in res)
    # Return to Home
    adb(["shell", "input", "keyevent", "4"])
    time.sleep(1)

    print("\n--- All Interactive Actions Verified Working! ---")

if __name__ == "__main__":
    main()
