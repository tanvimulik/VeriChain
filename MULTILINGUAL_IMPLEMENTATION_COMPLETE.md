# 🌍 Complete Multilingual & Voice Implementation

## ✅ Status: Ready to Implement

I've installed the required packages and created the foundation. Here's what you need to do to complete the implementation:

---

## 📦 Packages Installed

```bash
✅ react-i18next
✅ i18next  
✅ i18next-browser-languagedetector
```

---

## 📁 Files Created

### 1. Translation Files
- ✅ `frontend/src/i18n/translations/en.json` - English translations
- ⏳ `frontend/src/i18n/translations/hi.json` - Hindi translations (create next)
- ⏳ `frontend/src/i18n/translations/mr.json` - Marathi translations (create next)

### 2. Configuration
- ✅ `frontend/src/i18n/config.js` - i18n setup

### 3. Components Needed
- ⏳ `frontend/src/components/LanguageSelector.js`
- ⏳ `frontend/src/components/VoiceButton.js`
- ⏳ `frontend/src/components/VoiceToggle.js`
- ⏳ `frontend/src/components/GuidedMode.js`

### 4. Hooks Needed
- ⏳ `frontend/src/hooks/useVoice.js`
- ⏳ `frontend/src/hooks/useSpeechRecognition.js`

---

## 🚀 Quick Start Implementation

### Step 1: Initialize i18n in App.js

Add this at the top of `frontend/src/App.js`:

```javascript
import './i18n/config';
```

### Step 2: Create Hindi Translation File

**File:** `frontend/src/i18n/translations/hi.json`

Copy the structure from `en.json` and translate all values to Hindi.

Key translations:
- "Welcome to FarmConnect" → "फार्मकनेक्ट में आपका स्वागत है"
- "Login" → "लॉगिन"
- "Register" → "रजिस्टर करें"
- "Add New Crop" → "नई फसल जोड़ें"
- "Payment" → "भुगतान"

### Step 3: Create Marathi Translation File

**File:** `frontend/src/i18n/translations/mr.json`

Copy the structure from `en.json` and translate all values to Marathi.

Key translations:
- "Welcome to FarmConnect" → "फार्मकनेक्टमध्ये आपले स्वागत आहे"
- "Login" → "लॉगिन"
- "Register" → "नोंदणी करा"
- "Add New Crop" → "नवीन पीक जोडा"
- "Payment" → "पेमेंट"

### Step 4: Create Language Selector Component

**File:** `frontend/src/components/LanguageSelector.js`

```javascript
import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
  ];

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
    
    // Update backend if logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:8000/api/auth/update-language', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ language: lng }),
        });
        if (response.ok) {
          console.log('Language preference saved');
        }
      } catch (error) {
        console.error('Error updating language:', error);
      }
    }
  };

  return (
    <div className="language-selector">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          onClick={() => changeLanguage(lang.code)}
          title={lang.name}
        >
          <span className="flag">{lang.flag}</span>
          <span className="name">{lang.nativeName}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
```

**File:** `frontend/src/components/LanguageSelector.css`

```css
.language-selector {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lang-btn {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  min-width: 100px;
}

.lang-btn:hover {
  border-color: var(--primary-green);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.lang-btn.active {
  background: var(--primary-green);
  color: white;
  border-color: var(--primary-green);
}

.lang-btn .flag {
  font-size: 20px;
}

.lang-btn .name {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .lang-btn {
    min-width: auto;
    padding: 8px 12px;
  }
  
  .lang-btn .name {
    display: none;
  }
}
```

### Step 5: Create Voice Hook

**File:** `frontend/src/hooks/useVoice.js`

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const useVoice = () => {
  const { i18n } = useTranslation();
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem('voiceGuidanceEnabled');
    return saved === null ? true : saved === 'true';
  });

  const getVoiceLang = useCallback(() => {
    const langMap = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    return langMap[i18n.language] || 'en-US';
  }, [i18n.language]);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !text || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getVoiceLang();
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, getVoiceLang]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const toggleVoice = useCallback(() => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    localStorage.setItem('voiceGuidanceEnabled', newState.toString());
    
    if (!newState) {
      stop();
    }
    
    // Update backend if logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/api/auth/update-voice-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: newState }),
      }).catch(console.error);
    }
  }, [voiceEnabled, stop]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    stop,
    speaking,
    voiceEnabled,
    toggleVoice,
  };
};

export default useVoice;
```

### Step 6: Create Voice Button Component

**File:** `frontend/src/components/VoiceButton.js`

```javascript
import React from 'react';
import useVoice from '../hooks/useVoice';
import './VoiceButton.css';

const VoiceButton = ({ text, label, size = 'medium' }) => {
  const { speak, speaking, voiceEnabled } = useVoice();

  if (!voiceEnabled) return null;

  return (
    <button
      className={`voice-btn voice-btn-${size} ${speaking ? 'speaking' : ''}`}
      onClick={() => speak(text)}
      title={label || 'Click to hear'}
      type="button"
    >
      🔊
    </button>
  );
};

export default VoiceButton;
```

**File:** `frontend/src/components/VoiceButton.css`

```css
.voice-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.voice-btn-small {
  width: 32px;
  height: 32px;
  font-size: 16px;
}

.voice-btn-medium {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.voice-btn-large {
  width: 50px;
  height: 50px;
  font-size: 24px;
}

.voice-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.5);
}

.voice-btn.speaking {
  animation: pulse 1s infinite;
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}
```

### Step 7: Create Voice Toggle Component

**File:** `frontend/src/components/VoiceToggle.js`

```javascript
import React from 'react';
import { useTranslation } from 'react-i18next';
import useVoice from '../hooks/useVoice';
import './VoiceToggle.css';

const VoiceToggle = () => {
  const { t } = useTranslation();
  const { voiceEnabled, toggleVoice } = useVoice();

  return (
    <button
      className={`voice-toggle ${voiceEnabled ? 'enabled' : 'disabled'}`}
      onClick={toggleVoice}
      title={voiceEnabled ? t('voice.guidanceOn') : t('voice.guidanceOff')}
    >
      <span className="icon">{voiceEnabled ? '🔊' : '🔇'}</span>
      <span className="text">
        {voiceEnabled ? t('voice.guidanceOn') : t('voice.guidanceOff')}
      </span>
    </button>
  );
};

export default VoiceToggle;
```

**File:** `frontend/src/components/VoiceToggle.css`

```css
.voice-toggle {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.voice-toggle:hover {
  border-color: var(--primary-green);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.voice-toggle.enabled {
  background: var(--primary-green);
  color: white;
  border-color: var(--primary-green);
}

.voice-toggle .icon {
  font-size: 20px;
}

.voice-toggle .text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .voice-toggle .text {
    display: none;
  }
}
```

---

## 🔧 Backend Updates

### Update User Models

Add to both `Farmer.js` and `Buyer.js`:

```javascript
preferredLanguage: {
  type: String,
  enum: ['en', 'hi', 'mr'],
  default: 'en',
},
voiceGuidanceEnabled: {
  type: Boolean,
  default: true,
},
```

### Update Auth Controller

Add these functions to `backend/controllers/authController.js`:

```javascript
// Update language preference
exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const Model = userRole === 'Farmer' 
      ? require('../models/Farmer')
      : require('../models/Buyer');

    await Model.findByIdAndUpdate(userId, { preferredLanguage: language });

    res.json({
      success: true,
      message: 'Language preference updated',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update voice guidance preference
exports.updateVoiceGuidance = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const Model = userRole === 'Farmer'
      ? require('../models/Farmer')
      : require('../models/Buyer');

    await Model.findByIdAndUpdate(userId, { voiceGuidanceEnabled: enabled });

    res.json({
      success: true,
      message: 'Voice guidance preference updated',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Add Routes

Add to `backend/routes/authRoutes.js`:

```javascript
router.post('/update-language', authMiddleware, authController.updateLanguage);
router.post('/update-voice-guidance', authMiddleware, authController.updateVoiceGuidance);
```

---

## 📱 Usage in Pages

### Example: Update Login Page

```javascript
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useVoice from '../hooks/useVoice';
import VoiceButton from '../components/VoiceButton';
import LanguageSelector from '../components/LanguageSelector';
import VoiceToggle from '../components/VoiceToggle';

function FarmerLogin() {
  const { t } = useTranslation();
  const { speak } = useVoice();

  useEffect(() => {
    // Speak page guidance on load
    speak(t('login.voiceGuide'));
  }, [t, speak]);

  return (
    <div className="login-page">
      <div className="header-controls">
        <LanguageSelector />
        <VoiceToggle />
      </div>
      
      <h1>
        {t('login.farmerLogin')}
        <VoiceButton text={t('login.farmerLogin')} />
      </h1>
      
      <form>
        <div className="form-field">
          <label>
            {t('login.phone')}
            <VoiceButton text={t('login.phone')} size="small" />
          </label>
          <input 
            type="tel" 
            placeholder={t('login.phonePlaceholder')}
          />
        </div>
        
        <div className="form-field">
          <label>
            {t('login.password')}
            <VoiceButton text={t('login.password')} size="small" />
          </label>
          <input 
            type="password" 
            placeholder={t('login.passwordPlaceholder')}
          />
        </div>
        
        <button type="submit">
          {t('login.loginButton')}
        </button>
      </form>
    </div>
  );
}
```

---

## ✅ Implementation Checklist

- [x] Install i18next packages
- [x] Create i18n configuration
- [x] Create English translations
- [ ] Create Hindi translations
- [ ] Create Marathi translations
- [ ] Create LanguageSelector component
- [ ] Create VoiceButton component
- [ ] Create VoiceToggle component
- [ ] Create useVoice hook
- [ ] Update backend models
- [ ] Update auth controller
- [ ] Add backend routes
- [ ] Update all pages with translations
- [ ] Test language switching
- [ ] Test voice features

---

## 🚀 Next Steps

1. **Create Hindi and Marathi translation files**
2. **Create all components** (LanguageSelector, VoiceButton, VoiceToggle)
3. **Create useVoice hook**
4. **Update backend** (models, controller, routes)
5. **Update pages** to use translations
6. **Test complete flow**

Would you like me to continue creating the remaining files?
