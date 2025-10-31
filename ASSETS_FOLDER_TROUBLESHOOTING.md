# Assets Folder Troubleshooting Guide

## Problem
Files added/removed from the assets folder aren't being detected properly.

## Step-by-Step Fix

### Step 1: Verify Current Assets Folder Location
**IMPORTANT:** Make sure you're working in the correct folder!

**Full Path:**
```
C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets
```

**How to Verify:**
1. Open **File Explorer** (Windows Key + E)
2. Navigate to: `C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets`
3. Copy the path from the address bar
4. Verify it matches exactly

---

### Step 2: Check File Visibility Settings

**Windows might be hiding files!**

1. In File Explorer, go to the **assets** folder
2. Click **View** tab at the top
3. Check these boxes:
   - ✅ **Hidden items** (to show hidden files)
   - ✅ **File name extensions** (to see .png, .jpg, etc.)
4. Click **Options** → **Change folder and search options**
5. Go to **View** tab
6. Select **"Show hidden files, folders, and drives"**
7. Uncheck **"Hide extensions for known file types"**
8. Click **OK**

---

### Step 3: Force Refresh File Explorer

**After adding/removing files:**

1. Click inside the **assets** folder
2. Press **F5** (refresh)
3. Or right-click → **Refresh**

---

### Step 4: Verify File Names Match Exactly

**Common Issues:**
- ❌ Extra spaces: `"The Butchers Tallow  Logo.png"` (double space)
- ❌ Wrong capitalization: `"the butchers tallow logo.png"` vs `"The Butchers Tallow Logo.png"`
- ❌ Missing extension: `"The Butchers Tallow Logo"` (no .png)
- ❌ Wrong extension: `"The Butchers Tallow Logo.jpg"` (should be .png)

**How to Check:**
1. Right-click the file → **Properties**
2. Check the **exact filename** (including extension)
3. Compare with what's referenced in HTML files

---

### Step 5: Test File Detection Script

**Run this PowerShell command to list ALL files:**

```powershell
cd "C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets"
Get-ChildItem -Force | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
```

**What to look for:**
- File count matches what you see in File Explorer
- Latest files show recent `LastWriteTime`
- No unexpected files

---

### Step 6: Check for File Lock Issues

**Sometimes files are locked by other programs:**

1. Close **ALL** programs that might be using the files:
   - Image editors (Photoshop, GIMP, Paint)
   - File managers
   - Cursor/VS Code (temporarily close)
   - Browsers (if viewing images)

2. Try accessing the file again

---

### Step 7: Verify Git Tracking

**If files aren't tracked by Git, they might not show up:**

**Check if file is ignored:**
```powershell
cd "C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite"
git check-ignore -v assets/YourFileName.png
```

**Check Git status:**
```powershell
git status assets/
```

---

### Step 8: Clear Windows File Cache

**Force Windows to refresh its cache:**

1. Open **Command Prompt as Administrator**
2. Run:
   ```cmd
   cd "C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets"
   dir /a
   ```

3. Or use PowerShell:
   ```powershell
   [System.IO.Directory]::GetFiles("C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets")
   ```

---

### Step 9: Check for Multiple Assets Folders

**You might have files in the wrong location!**

**Search for ALL assets folders:**
```powershell
Get-ChildItem -Path "C:\Users\Philip\TheButchersTallow website" -Recurse -Directory -Filter "assets" | Select-Object FullName
```

**Verify you're editing files in the correct folder!**

---

### Step 10: Manual Verification Checklist

**Before adding a new file:**

- [ ] I'm in the correct folder: `MainWebsite\assets`
- [ ] File Explorer shows hidden files
- [ ] File has correct extension (.png, .jpg, etc.)
- [ ] File name matches exactly (spaces, capitalization)
- [ ] File is saved (not just open in editor)
- [ ] No programs are locking the file

**After adding a file:**

- [ ] Press **F5** to refresh File Explorer
- [ ] File appears in the list
- [ ] Right-click → Properties shows correct details
- [ ] Run PowerShell command to verify detection

---

## Quick Diagnostic Commands

**List all files with details:**
```powershell
cd "C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets"
Get-ChildItem -Force | Format-Table Name, Length, LastWriteTime -AutoSize
```

**Search for specific file:**
```powershell
Get-ChildItem -Path "C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets" -Recurse -Filter "*Oval*" | Select-Object FullName
```

**Count files:**
```powershell
(Get-ChildItem -Path "C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets" -File).Count
```

**List only image files:**
```powershell
Get-ChildItem -Path "C:\Users\Philip\TheButchersTallow website\repository destination\MainWebsite\assets" -Include *.png,*.jpg,*.jpeg,*.gif,*.webp | Select-Object Name
```

---

## Still Not Working?

**Try these advanced fixes:**

1. **Restart Windows Explorer:**
   - Press `Ctrl + Shift + Esc` (Task Manager)
   - Find "Windows Explorer"
   - Right-click → **Restart**

2. **Clear Windows Thumbnail Cache:**
   - Run: `cleanmgr`
   - Select "Thumbnails" → Clean

3. **Check Disk Permissions:**
   - Right-click assets folder → Properties → Security
   - Ensure your user has "Full Control"

4. **Use Full Paths:**
   - Instead of relative paths, use absolute paths in HTML:
   - `src="C:/Users/Philip/TheButchersTallow website/repository destination/MainWebsite/assets/filename.png"`

---

## Need More Help?

**Provide this information:**
1. Exact filename you're trying to add
2. Current file count in assets folder
3. Output of diagnostic commands above
4. Any error messages you see

