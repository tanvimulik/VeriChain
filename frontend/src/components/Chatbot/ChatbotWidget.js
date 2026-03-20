// client/src/components/Chatbot/ChatbotWidget.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './ChatbotWidget.css';

const ChatbotWidget = function() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync chatbot language with i18n language
  const currentLanguage = i18n.language;

  // Initialize speech recognition
  useEffect(function() {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on current selection
      updateRecognitionLanguage();
      
      // Handle results
      recognitionRef.current.onresult = function(event) {
        const text = event.results[0][0].transcript;
        setInputMessage(text);
        setIsListening(false);
        
        // Optional: Auto-send after voice input
        // sendMessage(text);
      };
      
      recognitionRef.current.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Show error message based on language
        let errorMsg = '';
        switch(currentLanguage) {
          case 'hi':
            errorMsg = 'माइक्रोफोन समस्या। कृपया फिर से प्रयास करें।';
            break;
          case 'mr':
            errorMsg = 'मायक्रोफोन समस्या। कृपया पुन्हा प्रयत्न करा।';
            break;
          default:
            errorMsg = 'Microphone issue. Please try again.';
        }
        
        // Add error message to chat
        setMessages(function(prev) {
          return [...prev, { 
            text: errorMsg, 
            sender: 'bot',
            isError: true
          }];
        });
      };
      
      recognitionRef.current.onend = function() {
        setIsListening(false);
      };
    }
    
    return function() {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Update recognition language when currentLanguage changes
  const updateRecognitionLanguage = function() {
    if (recognitionRef.current) {
      switch(currentLanguage) {
        case 'hi':
          recognitionRef.current.lang = 'hi-IN';
          break;
        case 'mr':
          recognitionRef.current.lang = 'mr-IN';
          break;
        default:
          recognitionRef.current.lang = 'en-IN'; // English with Indian accent
      }
    }
  };

  useEffect(function() {
    updateRecognitionLanguage();
  }, [currentLanguage]);

  // Initial greeting based on language
  useEffect(function() {
    if (isOpen && messages.length === 0) {
      let greeting = '';
      let options = [];
      
      switch(currentLanguage) {
        case 'hi':
          greeting = '🌾 नमस्ते! किसान बाज़ार में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?';
          options = ['🌽 मंडी भाव', '📝 कैसे बेचें', '🛒 कैसे खरीदें', '⭐ विश्वास स्कोर', '🚚 परिवहन'];
          break;
        case 'mr':
          greeting = '🌾 नमस्कार! शेतकरी बाजारात आपले स्वागत आहे. मी तुम्हाला कशी मदत करू शकतो?';
          options = ['🌽 मंडी भाव', '📝 कसे विकावे', '🛒 कसे विकत घ्यावे', '⭐ विश्वास स्कोर', '🚚 वाहतूक'];
          break;
        default:
          greeting = '🌾 Namaste! Welcome to Farm Marketplace. How can I help you today?';
          options = ['🌽 Mandi Prices', '📝 How to Sell', '🛒 How to Buy', '⭐ Trust Score', '🚚 Transport'];
      }
      
      setMessages([
        { 
          text: greeting,
          sender: 'bot',
          options: options
        }
      ]);
    }
  }, [isOpen, messages.length, currentLanguage]);

  // Auto-scroll to bottom
  useEffect(function() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async function(text) {
    if (!text || !text.trim()) return;

    // Add user message
    setMessages(function(prev) {
      return [...prev, { text: text, sender: 'user' }];
    });
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to backend with current language
      var response = await axios.post(
        'http://localhost:5000/api/chatbot/chat',
        { 
          message: text,
          language: currentLanguage
        }
      );

      setMessages(function(prev) {
        return [...prev, { 
          text: response.data.message, 
          sender: 'bot',
          timestamp: response.data.timestamp
        }];
      });

    } catch (error) {
      console.log('Using fallback responses');
      
      // Use multilingual fallback responses
      var fallbackResponse = getMultilingualResponse(text, currentLanguage);
      
      setMessages(function(prev) {
        return [...prev, { 
          text: fallbackResponse, 
          sender: 'bot',
          isError: false
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input handler
  const startVoiceInput = function() {
    if (!recognitionRef.current) {
      // Show not supported message
      let notSupportedMsg = '';
      switch(currentLanguage) {
        case 'hi':
          notSupportedMsg = 'क्षमा करें, आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता है। कृपया Chrome या Edge का उपयोग करें।';
          break;
        case 'mr':
          notSupportedMsg = 'क्षमा करा, तुमचा ब्राउझर व्हॉइस इनपुट सपोर्ट करत नाही. कृपया Chrome किंवा Edge वापरा.';
          break;
        default:
          notSupportedMsg = 'Sorry, your browser does not support voice input. Please use Chrome or Edge.';
      }
      
      setMessages(function(prev) {
        return [...prev, { 
          text: notSupportedMsg, 
          sender: 'bot',
          isError: true
        }];
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Update language before starting
      updateRecognitionLanguage();
      
      // Start listening
      try {
        recognitionRef.current.start();
        setIsListening(true);
        
        // Add listening indicator message
        let listeningMsg = '';
        switch(currentLanguage) {
          case 'hi':
            listeningMsg = '🎤 सुन रहा हूँ... बोलिए';
            break;
          case 'mr':
            listeningMsg = '🎤 ऐकत आहे... बोला';
            break;
          default:
            listeningMsg = '🎤 Listening... Speak now';
        }
        
        setMessages(function(prev) {
          return [...prev, { 
            text: listeningMsg, 
            sender: 'bot',
            isListening: true
          }];
        });
        
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
      }
    }
  };

  // Multilingual responses (keeping your existing function)
  var getMultilingualResponse = function(message, lang) {
    var lowerMsg = message.toLowerCase();
    
    // Helper function to get response in correct language
    const getText = function(en, hi, mr) {
      switch(lang) {
        case 'hi': return hi;
        case 'mr': return mr;
        default: return en;
      }
    };

    // Tomato price
    if (lowerMsg.includes('tomato') || lowerMsg.includes('टमाटर') || lowerMsg.includes('टोमॅटो')) {
      return getText(
        '🍅 **Tomato Mandi Price**\n\n• Current: ₹15-25 per kg\n• Best Quality: ₹25-30 per kg\n• Yesterday: ₹18 per kg\n• Trend: 📈 Rising\n\nTop mandis:\n• Azadpur Mandi, Delhi: ₹22/kg\n• Vashi Mandi, Mumbai: ₹20/kg\n• Koyambedu, Chennai: ₹18/kg',
        
        '🍅 **टमाटर मंडी भाव**\n\n• वर्तमान: ₹15-25 प्रति किलो\n• बेस्ट क्वालिटी: ₹25-30 प्रति किलो\n• कल: ₹18 प्रति किलो\n• रुझान: 📈 बढ़ रहा\n\nप्रमुख मंडियां:\n• आज़ादपुर मंडी, दिल्ली: ₹22/किलो\n• वाशी मंडी, मुंबई: ₹20/किलो\n• कोयम्बेडु, चेन्नई: ₹18/किलो',
        
        '🍅 **टोमॅटो मंडी भाव**\n\n• सध्याचे: ₹15-25 प्रति किलो\n• उत्तम दर्जा: ₹25-30 प्रति किलो\n• काल: ₹18 प्रति किलो\n• कल: 📈 वाढता\n\nप्रमुख मंड्या:\n• आझादपूर मंडी, दिल्ली: ₹22/किलो\n• वाशी मंडी, मुंबई: ₹20/किलो\n• कोयंबेडू, चेन्नई: ₹18/किलो'
      );
    }

    // Potato price
    else if (lowerMsg.includes('potato') || lowerMsg.includes('आलू') || lowerMsg.includes('बटाटा')) {
      return getText(
        '🥔 **Potato Mandi Price**\n\n• Current: ₹12-18 per kg\n• Best Quality: ₹18-22 per kg\n• Yesterday: ₹15 per kg\n• Trend: 📉 Falling\n\nTop mandis:\n• Agra Mandi: ₹14/kg\n• Bangalore Mandi: ₹16/kg\n• Kolkata Mandi: ₹13/kg',
        
        '🥔 **आलू मंडी भाव**\n\n• वर्तमान: ₹12-18 प्रति किलो\n• बेस्ट क्वालिटी: ₹18-22 प्रति किलो\n• कल: ₹15 प्रति किलो\n• रुझान: 📉 गिर रहा\n\nप्रमुख मंडियां:\n• आगरा मंडी: ₹14/किलो\n• बैंगलोर मंडी: ₹16/किलो\n• कोलकाता मंडी: ₹13/किलो',
        
        '🥔 **बटाटा मंडी भाव**\n\n• सध्याचे: ₹12-18 प्रति किलो\n• उत्तम दर्जा: ₹18-22 प्रति किलो\n• काल: ₹15 प्रति किलो\n• कल: 📉 घटता\n\nप्रमुख मंड्या:\n• आग्रा मंडी: ₹14/किलो\n• बंगळुरू मंडी: ₹16/किलो\n• कोलकाता मंडी: ₹13/किलो'
      );
    }

    // Onion price
    else if (lowerMsg.includes('onion') || lowerMsg.includes('प्याज') || lowerMsg.includes('कांदा')) {
      return getText(
        '🧅 **Onion Mandi Price**\n\n• Current: ₹20-28 per kg\n• Best Quality: ₹28-35 per kg\n• Yesterday: ₹22 per kg\n• Trend: 📈 Rising\n\n• Lasalgaon Mandi: ₹25/kg\n• Nashik Mandi: ₹24/kg\n• Delhi Mandi: ₹26/kg',
        
        '🧅 **प्याज मंडी भाव**\n\n• वर्तमान: ₹20-28 प्रति किलो\n• बेस्ट क्वालिटी: ₹28-35 प्रति किलो\n• कल: ₹22 प्रति किलो\n• रुझान: 📈 बढ़ रहा\n\n• लासलगांव मंडी: ₹25/किलो\n• नासिक मंडी: ₹24/किलो\n• दिल्ली मंडी: ₹26/किलो',
        
        '🧅 **कांदा मंडी भाव**\n\n• सध्याचे: ₹20-28 प्रति किलो\n• उत्तम दर्जा: ₹28-35 प्रति किलो\n• काल: ₹22 प्रति किलो\n• कल: 📈 वाढता\n\n• लासलगाव मंडी: ₹25/किलो\n• नाशिक मंडी: ₹24/किलो\n• दिल्ली मंडी: ₹26/किलो'
      );
    }

    // General price query
    else if (lowerMsg.includes('price') || lowerMsg.includes('भाव') || lowerMsg.includes('मंडी') || lowerMsg.includes('rate')) {
      return getText(
        '📊 **Current Mandi Prices**\n\n🍅 Tomato: ₹15-25/kg\n🥔 Potato: ₹12-18/kg\n🧅 Onion: ₹20-28/kg\n🌾 Rice: ₹25-35/kg\n🌽 Wheat: ₹22-26/kg\n🥕 Carrot: ₹30-40/kg\n🌶️ Green Chilli: ₹40-50/kg\n\nTell me which crop you want to know about?',
        
        '📊 **वर्तमान मंडी भाव**\n\n🍅 टमाटर: ₹15-25/किलो\n🥔 आलू: ₹12-18/किलो\n🧅 प्याज: ₹20-28/किलो\n🌾 चावल: ₹25-35/किलो\n🌽 गेहूं: ₹22-26/किलो\n🥕 गाजर: ₹30-40/किलो\n🌶️ हरी मिर्च: ₹40-50/किलो\n\nबताएं किस फसल का भाव जानना चाहते हैं?',
        
        '📊 **सध्याचे मंडी भाव**\n\n🍅 टोमॅटो: ₹15-25/किलो\n🥔 बटाटा: ₹12-18/किलो\n🧅 कांदा: ₹20-28/किलो\n🌾 तांदूळ: ₹25-35/किलो\n🌽 गहू: ₹22-26/किलो\n🥕 गाजर: ₹30-40/किलो\n🌶️ हिरवी मिरची: ₹40-50/किलो\n\nकोणत्या पिकाचा भाव हवा आहे ते सांगा?'
      );
    }

    // How to sell
    else if (lowerMsg.includes('sell') || lowerMsg.includes('बेच') || lowerMsg.includes('विक')) {
      return getText(
        '📝 **How to Sell Your Crops**\n\n1. **Register** as a farmer (free!)\n2. **Add photos** of your crop\n3. **Set price** or use mandi rate\n4. **Choose quantity**\n5. **Publish** your listing\n\nBenefits:\n✅ Direct to buyers\n✅ No middleman\n✅ Better prices\n✅ Quick payment',
        
        '📝 **अपनी फसल कैसे बेचें**\n\n1. **रजिस्टर** करें किसान के रूप में (मुफ्त!)\n2. **फोटो** जोड़ें अपनी फसल की\n3. **कीमत** तय करें या मंडी भाव देखें\n4. **मात्रा** चुनें\n5. **लिस्टिंग** प्रकाशित करें\n\nफायदे:\n✅ सीधे खरीददारों को\n✅ बिचौलिया नहीं\n✅ बेहतर कीमत\n✅ जल्दी भुगतान',
        
        '📝 **तुमचे पीक कसे विकावे**\n\n1. **नोंदणी** करा शेतकरी म्हणून (मोफत!)\n2. **फोटो** जोडा पिकाचे\n3. **किंमत** ठरवा किंवा मंडी भाव पहा\n4. **प्रमाण** निवडा\n5. **यादी** प्रकाशित करा\n\nफायदे:\n✅ थेट खरेदीदारांना\n✅ मध्यस्थ नाही\n✅ चांगली किंमत\n✅ लवकर पैसे'
      );
    }

    // How to buy
    else if (lowerMsg.includes('buy') || lowerMsg.includes('खरीद') || lowerMsg.includes('खरेदी')) {
      return getText(
        '🛒 **How to Buy Fresh Farm Produce**\n\n1. **Browse** marketplace\n2. **Select** crop you need\n3. **Check** farmer trust score\n4. **Negotiate** price\n5. **Place order**\n6. **Pay** securely\n7. **Track** delivery\n\nBenefits:\n✅ Fresh from farm\n✅ Fair prices\n✅ Quality guaranteed',
        
        '🛒 **ताजी किसान उपज कैसे खरीदें**\n\n1. **ब्राउज़** करें बाजार\n2. **चुनें** अपनी जरूरत की फसल\n3. **जांचें** किसान का विश्वास स्कोर\n4. **मोलभाव** करें कीमत\n5. **ऑर्डर** करें\n6. **भुगतान** करें सुरक्षित\n7. **ट्रैक** करें डिलीवरी\n\nफायदे:\n✅ खेत से ताजा\n✅ उचित कीमत\n✅ गुणवत्ता गारंटी',
        
        '🛒 **ताजे शेतमाल कसे विकत घ्यावे**\n\n1. **ब्राउझ** करा बाजार\n2. **निवडा** हवे ते पीक\n3. **तपासा** शेतकरी विश्वास स्कोर\n4. **भाव** करार करा\n5. **ऑर्डर** करा\n6. **पैसे** भरा सुरक्षित\n7. **ट्रॅक** करा वितरण\n\nफायदे:\n✅ शेतातून ताजे\n✅ योग्य किंमत\n✅ दर्जा हमी'
      );
    }

    // Trust score
    else if (lowerMsg.includes('trust') || lowerMsg.includes('विश्वास') || lowerMsg.includes('score')) {
      return getText(
        '⭐ **Trust Score System**\n\nHigh trust score farmers:\n• ✅ Complete KYC\n• ✅ 50+ successful sales\n• ✅ 4.5+ star rating\n• ✅ On-time delivery\n\nHow to increase score:\n• Complete profile\n• Verify phone & bank\n• Get good reviews\n• Deliver on time',
        
        '⭐ **विश्वास स्कोर प्रणाली**\n\nउच्च विश्वास स्कोर किसान:\n• ✅ पूर्ण केवाईसी\n• ✅ 50+ सफल बिक्री\n• ✅ 4.5+ स्टार रेटिंग\n• ✅ समय पर डिलीवरी\n\nस्कोर कैसे बढ़ाएं:\n• प्रोफाइल पूरा करें\n• फोन और बैंक वेरिफाई करें\n• अच्छी समीक्षा पाएं\n• समय पर डिलीवरी करें',
        
        '⭐ **विश्वास स्कोर प्रणाली**\n\nउच्च विश्वास स्कोर शेतकरी:\n• ✅ पूर्ण केवायसी\n• ✅ 50+ यशस्वी विक्री\n• ✅ 4.5+ स्टार रेटिंग\n• ✅ वेळेवर वितरण\n\nस्कोर कसा वाढवायचा:\n• प्रोफाइल पूर्ण करा\n• फोन आणि बँक सत्यापित करा\n• चांगली पुनरावलोकने मिळवा\n• वेळेवर वितरण करा'
      );
    }

    // Transport
    else if (lowerMsg.includes('transport') || lowerMsg.includes('परिवहन') || lowerMsg.includes('वाहतूक')) {
      return getText(
        '🚚 **Transportation Services**\n\n• **Small truck**: 500kg - ₹1500\n• **Medium truck**: 2 ton - ₹3000\n• **Large truck**: 5 ton - ₹5000\n• **Cold storage**: ₹2/kg/day\n\nFeatures:\n📍 Real-time tracking\n📦 Insurance included\n👨‍🌾 Experienced drivers',
        
        '🚚 **परिवहन सेवाएं**\n\n• **छोटा ट्रक**: 500kg - ₹1500\n• **मीडियम ट्रक**: 2 टन - ₹3000\n• **बड़ा ट्रक**: 5 टन - ₹5000\n• **कोल्ड स्टोरेज**: ₹2/किलो/दिन\n\nसुविधाएं:\n📍 रियल-टाइम ट्रैकिंग\n📦 बीमा शामिल\n👨‍🌾 अनुभवी ड्राइवर',
        
        '🚚 **वाहतूक सेवा**\n\n• **छोटा ट्रक**: 500kg - ₹1500\n• **मध्यम ट्रक**: 2 टन - ₹3000\n• **मोठा ट्रक**: 5 टन - ₹5000\n• **कोल्ड स्टोरेज**: ₹2/किलो/दिन\n\nवैशिष्ट्ये:\n📍 रिअल-टाइम ट्रॅकिंग\n📦 विमा समाविष्ट\n👨‍🌾 अनुभवी ड्रायव्हर'
      );
    }

    // Greeting
    else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('namaste') || lowerMsg.includes('नमस्ते')) {
      return getText(
        '👋 Namaste! I\'m your farm assistant. Ask me about:\n\n• Mandi prices 📊\n• Selling crops 📝\n• Buying produce 🛒\n• Trust scores ⭐\n• Transport 🚚',
        
        '👋 नमस्ते! मैं आपका किसान सहायक हूँ। मुझसे पूछें:\n\n• मंडी भाव 📊\n• फसल बेचना 📝\n• उपज खरीदना 🛒\n• विश्वास स्कोर ⭐\n• परिवहन 🚚',
        
        '👋 नमस्कार! मी तुमचा शेतकरी सहाय्यक आहे. मला विचारा:\n\n• मंडी भाव 📊\n• पीक विक्री 📝\n• उपज खरेदी 🛒\n• विश्वास स्कोर ⭐\n• वाहतूक 🚚'
      );
    }

    // Thank you
    else if (lowerMsg.includes('thank') || lowerMsg.includes('धन्यवाद')) {
      return getText(
        '🙏 You\'re welcome! Happy farming! Visit us again.',
        '🙏 आपका स्वागत है! खेती करते रहें! फिर मिलेंगे।',
        '🙏 आपले स्वागत आहे! शेती करत रहा! पुन्हा भेटू.'
      );
    }

    // Default response
    else {
      return getText(
        '🤖 I can help you with:\n\n🌽 **Mandi Prices** - Current rates\n📝 **How to Sell** - Step by step guide\n🛒 **How to Buy** - Shopping guide\n⭐ **Trust Scores** - Reputation system\n🚚 **Transport** - Delivery options\n\nWhat would you like to know?',
        
        '🤖 मैं आपकी इन चीजों में मदद कर सकता हूँ:\n\n🌽 **मंडी भाव** - वर्तमान दरें\n📝 **कैसे बेचें** - चरण दर चरण मार्गदर्शन\n🛒 **कैसे खरीदें** - खरीदारी गाइड\n⭐ **विश्वास स्कोर** - प्रतिष्ठा प्रणाली\n🚚 **परिवहन** - डिलीवरी विकल्प\n\nआप क्या जानना चाहेंगे?',
        
        '🤖 मी तुम्हाला यामध्ये मदत करू शकतो:\n\n🌽 **मंडी भाव** - सध्याचे दर\n📝 **कसे विकावे** - चरण-दर-चरण मार्गदर्शन\n🛒 **कसे विकत घ्यावे** - खरेदी मार्गदर्शन\n⭐ **विश्वास स्कोर** - प्रतिष्ठा प्रणाली\n🚚 **वाहतूक** - वितरण पर्याय\n\nतुम्हाला काय जाणून घ्यायचे आहे?'
      );
    }
  };

  var handleQuickAction = function(action) {
    // Strip emojis and send appropriate query
    let query = action.replace(/[🌽📝🛒⭐🚚]/g, '').trim();
    
    switch(action) {
      case '🌽 Mandi Prices':
      case '🌽 मंडी भाव':
        sendMessage('mandi prices');
        break;
      case '📝 How to Sell':
      case '📝 कैसे बेचें':
      case '📝 कसे विकावे':
        sendMessage('how to sell');
        break;
      case '🛒 How to Buy':
      case '🛒 कैसे खरीदें':
      case '🛒 कसे विकत घ्यावे':
        sendMessage('how to buy');
        break;
      case '⭐ Trust Score':
      case '⭐ विश्वास स्कोर':
        sendMessage('trust score');
        break;
      case '🚚 Transport':
      case '🚚 परिवहन':
      case '🚚 वाहतूक':
        sendMessage('transport');
        break;
      default:
        sendMessage(query);
    }
  };

  var handleKeyPress = function(event) {
    if (event.key === 'Enter') {
      sendMessage(inputMessage);
    }
  };

  // Handle language change from i18n
  const changeLanguage = function(lng) {
    i18n.changeLanguage(lng);
  };

  return React.createElement(
    'div',
    { className: 'chatbot-container' },
    // Chat Button
    React.createElement(
      'button',
      { 
        className: 'chatbot-button ' + (isOpen ? 'open' : ''),
        onClick: function() { setIsOpen(!isOpen); }
      },
      isOpen ? '✕' : '💬'
    ),
    // Chat Window
    isOpen && React.createElement(
      'div',
      { className: 'chatbot-window' },
      // Header
      React.createElement(
        'div',
        { className: 'chatbot-header' },
        React.createElement(
          'div',
          { className: 'header-title' },
          React.createElement('span', { className: 'bot-icon' }, '🌾'),
          React.createElement('h3', null, 
            currentLanguage === 'hi' ? 'किसान सहायक' :
            currentLanguage === 'mr' ? 'शेतकरी सहाय्यक' :
            'Farm Assistant'
          )
        ),
        React.createElement(
          'div',
          { className: 'header-controls' },
          React.createElement(
            'select',
            { 
              value: currentLanguage, 
              onChange: function(e) { changeLanguage(e.target.value); },
              className: 'language-select'
            },
            React.createElement('option', { value: 'en' }, 'English'),
            React.createElement('option', { value: 'hi' }, 'हिंदी'),
            React.createElement('option', { value: 'mr' }, 'मराठी')
          ),
          React.createElement(
            'button',
            { onClick: function() { setIsOpen(false); } },
            '✕'
          )
        )
      ),
      // Messages
      React.createElement(
        'div',
        { className: 'chatbot-messages' },
        messages.map(function(msg, index) {
          return React.createElement(
            'div',
            { 
              key: index, 
              className: 'message ' + msg.sender + (msg.isError ? ' error' : '') + (msg.isListening ? ' listening' : '')
            },
            msg.sender === 'bot' && React.createElement('span', { className: 'bot-avatar' }, '🌾'),
            React.createElement(
              'div',
              { className: 'message-content' },
              React.createElement('p', { style: { whiteSpace: 'pre-line' } }, msg.text),
              msg.options && React.createElement(
                'div',
                { className: 'quick-options' },
                msg.options.map(function(option, i) {
                  return React.createElement(
                    'button',
                    { 
                      key: i,
                      onClick: function() { handleQuickAction(option); },
                      className: 'quick-option-btn'
                    },
                    option
                  );
                })
              ),
              msg.timestamp && React.createElement(
                'small',
                { className: 'timestamp' },
                new Date(msg.timestamp).toLocaleTimeString()
              )
            )
          );
        }),
        isLoading && React.createElement(
          'div',
          { className: 'message bot' },
          React.createElement('span', { className: 'bot-avatar' }, '🌾'),
          React.createElement(
            'div',
            { className: 'message-content' },
            React.createElement(
              'div',
              { className: 'typing-indicator' },
              React.createElement('span', null),
              React.createElement('span', null),
              React.createElement('span', null)
            )
          )
        ),
        React.createElement('div', { ref: messagesEndRef })
      ),
      // Input
      React.createElement(
        'div',
        { className: 'chatbot-input' },
        React.createElement('input', {
          type: 'text',
          value: inputMessage,
          onChange: function(e) { setInputMessage(e.target.value); },
          onKeyPress: handleKeyPress,
          placeholder: currentLanguage === 'hi' ? 'अपना संदेश लिखें...' :
                      currentLanguage === 'mr' ? 'तुमचा संदेश लिहा...' :
                      'Type your message...',
          disabled: isLoading
        }),
        React.createElement(
          'button',
          { 
            onClick: function() { sendMessage(inputMessage); },
            disabled: isLoading || !inputMessage.trim()
          },
          currentLanguage === 'hi' ? 'भेजें' :
          currentLanguage === 'mr' ? 'पाठवा' :
          'Send'
        )
      ),
      // Voice Input Button - Now Working!
      React.createElement(
        'button',
        { 
          className: `voice-input-btn ${isListening ? 'listening' : ''}`,
          title: currentLanguage === 'hi' ? 'बोलकर पूछें' :
                 currentLanguage === 'mr' ? 'बोलून विचारा' :
                 'Click to speak',
          onClick: startVoiceInput
        },
        isListening ? '⏹️' : '🎤'
      )
    )
  );
};

export default ChatbotWidget;