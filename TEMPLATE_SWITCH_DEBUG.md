# Template Switch Debug Guide

## 🐛 **Issue**: Template switching not working in Builder page

## 🔍 **Debugging Steps Added**

### **1. Enhanced Console Logging**
- ✅ Added detailed logs to `handleTemplateChange` function
- ✅ Added logs to track `activeTemplate` state changes
- ✅ Added logs to `ResumePreview` component rendering
- ✅ Added logs to Template button click handler

### **2. Visual Debug Indicators**
- ✅ Added current template indicator above preview
- ✅ Added "switching..." indicator during template changes
- ✅ Added test buttons for direct template switching

### **3. Debug Tools Created**
- ✅ `public/debug-template-switch.html` - Interactive debug tool
- ✅ Live console output capture
- ✅ Template switch checklist

## 🧪 **How to Debug**

### **Step 1: Open Debug Tool**
1. Navigate to `/debug-template-switch.html` in browser
2. Click "Open Builder Page" button
3. Keep debug tool open in another tab

### **Step 2: Test Template Button**
1. In builder page, look for "📄 Template" button next to "🎨 Colors"
2. Click the Template button
3. Check console for: `🔘 Template button clicked`
4. Check if modal opens

### **Step 3: Test Direct Template Switch**
1. Try the green "Test 1" and "Test 2" buttons
2. Check console for template change logs
3. Watch the "Current Template" indicator above preview

### **Step 4: Check Console Logs**
Expected log sequence:
```
🔘 Template button clicked
Current activeTemplate: Clean Chromatic
Available templates: (17) ['Clean Chromatic', 'Contemporary Contrast', ...]
Template modal state changed: true
🎨 Template Change: "Clean Chromatic" → "Contemporary Contrast"
✅ Template "Contemporary Contrast" found, switching...
📋 Active template updated: Contemporary Contrast
🎨 ResumePreview rendering with template: Contemporary Contrast
✅ Successfully rendering template: Contemporary Contrast
✅ Template change completed: Contemporary Contrast
```

## 🔧 **Potential Issues & Solutions**

### **Issue 1: Template Button Not Working**
**Symptoms**: No console log when clicking Template button
**Solution**: Check if button exists and click handler is attached

### **Issue 2: Modal Not Opening**
**Symptoms**: Button click logged but modal doesn't appear
**Check**: 
- `showTemplateModal` state updates
- Modal component is rendered
- No CSS z-index issues

### **Issue 3: Template Selection Not Working**
**Symptoms**: Modal opens but template doesn't change
**Check**:
- `handleTemplateChange` function is called
- `activeTemplate` state updates
- Template exists in templates object

### **Issue 4: Preview Not Updating**
**Symptoms**: Template state changes but preview stays the same
**Check**:
- `ResumePreview` has `key={activeTemplate}` prop
- Template component renders without errors
- No React memo dependency issues

### **Issue 5: Template Not Found**
**Symptoms**: Error logs about template not found
**Check**:
- Template name matches exactly (case-sensitive)
- Template is imported correctly
- Templates object contains all templates

## 🛠️ **Quick Fixes Applied**

### **1. Enhanced Template Button**
```jsx
<button
  onClick={() => {
    console.log('🔘 Template button clicked');
    console.log('Current activeTemplate:', activeTemplate);
    console.log('Available templates:', Object.keys(templates));
    setShowTemplateModal(true);
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
>
  📄 Template
</button>
```

### **2. Added Test Buttons**
```jsx
<button
  onClick={() => {
    console.log('🧪 Testing direct template switch to Contemporary Contrast');
    handleTemplateChange('Contemporary Contrast');
  }}
  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
>
  Test 1
</button>
```

### **3. Enhanced Template Change Handler**
```jsx
const handleTemplateChange = (templateName) => {
  console.log(`🎨 Template Change: "${activeTemplate}" → "${templateName}"`);
  console.log('Available templates:', Object.keys(templates));
  
  if (!templates[templateName]) {
    console.error(`❌ Template "${templateName}" not found!`);
    console.error('Available templates:', Object.keys(templates));
    return;
  }
  
  console.log(`✅ Template "${templateName}" found, switching...`);
  setIsTemplateChanging(true);
  setActiveTemplate(templateName);
  
  setTimeout(() => {
    setIsTemplateChanging(false);
    console.log(`✅ Template change completed: ${templateName}`);
  }, 300);
};
```

### **4. Added Current Template Indicator**
```jsx
<div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-center">
  <p className="text-xs text-blue-600 font-medium">Current Template</p>
  <p className="text-sm font-bold text-blue-800">{activeTemplate}</p>
  {isTemplateChanging && (
    <p className="text-xs text-blue-500 mt-1">🔄 Switching...</p>
  )}
</div>
```

## 📋 **Debug Checklist**

- [ ] Template button exists and is visible
- [ ] Template button click logs appear in console
- [ ] Template modal opens when button is clicked
- [ ] Template selection triggers handleTemplateChange
- [ ] activeTemplate state updates correctly
- [ ] ResumePreview re-renders with new template
- [ ] Template component renders without errors
- [ ] Current template indicator updates
- [ ] No JavaScript errors in console

## 🎯 **Next Steps**

1. **Test the debug buttons** - Use Test 1 and Test 2 buttons to bypass modal
2. **Check console logs** - Look for the expected log sequence
3. **Verify template indicator** - Watch the "Current Template" box above preview
4. **Test modal functionality** - Click Template button and select from modal
5. **Report findings** - Share console logs and behavior observed

---

## 🚀 **Expected Result**
After debugging, template switching should work smoothly:
- Click Template button → Modal opens
- Select template → Preview updates immediately
- Current template indicator shows new template
- Console logs confirm successful switch