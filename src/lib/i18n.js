// ── MediIntake Translations ───────────────────────────────
export const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',    flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी',    flag: '🇮🇳' },
]

export const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard', newIntake: 'New Intake', records: 'Records',
    healthScore: 'Health Score', hospitals: 'Hospitals', vaccines: 'Vaccines',
    appointments: 'Appointments', medications: 'Medications', alerts: 'Alerts',
    profile: 'Profile', editProfile: 'Edit Profile', password: 'Password',
    pharmacy: 'Pharmacy', doctors: 'Doctors',
    // Dashboard
    hello: 'Hello', healthOverview: "Here's your health overview for today",
    dailyTip: 'Daily Health Tip', quickActions: 'Quick Actions',
    recentIntakes: 'Recent Intakes', viewAll: 'View all →',
    totalIntakes: 'Total Intakes', highRisk: 'High Risk',
    mediumRisk: 'Medium Risk', lowRisk: 'Low Risk',
    noIntakes: 'No intakes yet', loading: 'Loading…',
    reportSymptoms: 'Report symptoms', viewSummary: 'View summary',
    findNearby: 'Find nearby', bookVisit: 'Book a visit',
    trackDoses: 'Track doses', healthRecords: 'Health records', fullHistory: 'Full history',
    // Auth
    signIn: 'Sign In', register: 'Register', patient: 'Patient',
    hospitalStaff: 'Hospital Staff', emailAddress: 'Email Address',
    continueGoogle: 'Continue with Google', phoneOTP: 'Phone / OTP',
    sendOTP: 'Send OTP', verifyOTP: 'Verify OTP & Sign In',
    signingIn: 'Signing in…', noAccount: "Don't have an account?",
    // Risk
    low: 'Low', medium: 'Medium', high: 'High', risk: 'Risk',
    // Common
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    submit: 'Submit', back: 'Back', next: 'Next', close: 'Close',
    reviewed: 'Reviewed', pending: 'Pending', confirmed: 'Confirmed',
    cancelled: 'Cancelled', active: 'Active',
    // Health tips
    tips: [
      'Drink at least 8 glasses of water daily to stay hydrated.',
      'Aim for 7–9 hours of sleep every night for optimal recovery.',
      'A 30-minute walk daily significantly reduces cardiovascular risk.',
      'Eat a balanced diet rich in fruits, vegetables and whole grains.',
      'Monitor your blood pressure regularly if you are over 40.',
    ],
    // Intake
    symptoms: 'Symptoms', severity: 'Severity', vitals: 'Vitals',
    temperature: 'Temperature', heartRate: 'Heart Rate', bloodPressure: 'Blood Pressure',
    notes: 'Notes', submitIntake: 'Submit Intake', riskScore: 'Risk Score',
    mild: 'Mild', moderate: 'Moderate', severe: 'Severe',
    // Profile
    fullName: 'Full Name', age: 'Age', gender: 'Gender', phone: 'Phone',
    bloodGroup: 'Blood Group', allergies: 'Allergies',
    emergencyContact: 'Emergency Contact', medicalHistory: 'Medical History',
    // Errors
    locationError: 'Could not get your location. Please allow location access.',
    noPharmacies: 'No pharmacies found. Try increasing the radius.',
  },

  hi: {
    // Nav
    dashboard: 'डैशबोर्ड', newIntake: 'नई एंट्री', records: 'रिकॉर्ड',
    healthScore: 'स्वास्थ्य स्कोर', hospitals: 'अस्पताल', vaccines: 'टीके',
    appointments: 'अपॉइंटमेंट', medications: 'दवाइयाँ', alerts: 'अलर्ट',
    profile: 'प्रोफ़ाइल', editProfile: 'प्रोफ़ाइल संपादित करें', password: 'पासवर्ड',
    pharmacy: 'फार्मेसी', doctors: 'डॉक्टर',
    // Dashboard
    hello: 'नमस्ते', healthOverview: 'आज का आपका स्वास्थ्य सारांश',
    dailyTip: 'दैनिक स्वास्थ्य सुझाव', quickActions: 'त्वरित कार्य',
    recentIntakes: 'हाल की प्रविष्टियाँ', viewAll: 'सभी देखें →',
    totalIntakes: 'कुल प्रविष्टियाँ', highRisk: 'उच्च जोखिम',
    mediumRisk: 'मध्यम जोखिम', lowRisk: 'कम जोखिम',
    noIntakes: 'कोई प्रविष्टि नहीं', loading: 'लोड हो रहा है…',
    reportSymptoms: 'लक्षण बताएं', viewSummary: 'सारांश देखें',
    findNearby: 'पास में खोजें', bookVisit: 'मुलाकात बुक करें',
    trackDoses: 'खुराक ट्रैक करें', healthRecords: 'स्वास्थ्य रिकॉर्ड', fullHistory: 'पूरा इतिहास',
    // Auth
    signIn: 'साइन इन', register: 'रजिस्टर', patient: 'मरीज़',
    hospitalStaff: 'अस्पताल कर्मचारी', emailAddress: 'ईमेल पता',
    continueGoogle: 'Google से जारी रखें', phoneOTP: 'फ़ोन / OTP',
    sendOTP: 'OTP भेजें', verifyOTP: 'OTP सत्यापित करें',
    signingIn: 'साइन इन हो रहा है…', noAccount: 'खाता नहीं है?',
    // Risk
    low: 'कम', medium: 'मध्यम', high: 'उच्च', risk: 'जोखिम',
    // Common
    save: 'सहेजें', cancel: 'रद्द करें', delete: 'हटाएं', edit: 'संपादित करें',
    submit: 'जमा करें', back: 'वापस', next: 'अगला', close: 'बंद करें',
    reviewed: 'समीक्षित', pending: 'लंबित', confirmed: 'पुष्टि', cancelled: 'रद्द',
    active: 'सक्रिय',
    tips: [
      'हर दिन कम से कम 8 गिलास पानी पिएं।',
      'बेहतर स्वास्थ्य के लिए रात में 7–9 घंटे सोएं।',
      'रोज़ 30 मिनट की सैर दिल की बीमारी का खतरा कम करती है।',
      'फल, सब्जियाँ और अनाज से भरपूर संतुलित आहार लें।',
      '40 से ऊपर हैं तो नियमित रूप से रक्तचाप जाँचें।',
    ],
    symptoms: 'लक्षण', severity: 'गंभीरता', vitals: 'वाइटल्स',
    temperature: 'तापमान', heartRate: 'हृदय गति', bloodPressure: 'रक्तचाप',
    notes: 'नोट्स', submitIntake: 'प्रविष्टि जमा करें', riskScore: 'जोखिम स्कोर',
    mild: 'हल्का', moderate: 'मध्यम', severe: 'गंभीर',
    fullName: 'पूरा नाम', age: 'आयु', gender: 'लिंग', phone: 'फ़ोन',
    bloodGroup: 'रक्त समूह', allergies: 'एलर्जी',
    emergencyContact: 'आपातकालीन संपर्क', medicalHistory: 'चिकित्सा इतिहास',
    locationError: 'आपका स्थान नहीं मिल सका। कृपया लोकेशन एक्सेस दें।',
    noPharmacies: 'कोई फार्मेसी नहीं मिली। त्रिज्या बढ़ाएं।',
  },

  mr: {
    // Nav
    dashboard: 'डॅशबोर्ड', newIntake: 'नवीन नोंद', records: 'नोंदी',
    healthScore: 'आरोग्य स्कोर', hospitals: 'रुग्णालये', vaccines: 'लसी',
    appointments: 'भेटी', medications: 'औषधे', alerts: 'सूचना',
    profile: 'प्रोफाइल', editProfile: 'प्रोफाइल संपादित करा', password: 'पासवर्ड',
    pharmacy: 'औषधालय', doctors: 'डॉक्टर',
    // Dashboard
    hello: 'नमस्कार', healthOverview: 'आजचा तुमचा आरोग्य सारांश',
    dailyTip: 'दैनिक आरोग्य सल्ला', quickActions: 'त्वरित क्रिया',
    recentIntakes: 'अलीकडील नोंदी', viewAll: 'सर्व पाहा →',
    totalIntakes: 'एकूण नोंदी', highRisk: 'उच्च धोका',
    mediumRisk: 'मध्यम धोका', lowRisk: 'कमी धोका',
    noIntakes: 'कोणतीही नोंद नाही', loading: 'लोड होत आहे…',
    reportSymptoms: 'लक्षणे सांगा', viewSummary: 'सारांश पाहा',
    findNearby: 'जवळपास शोधा', bookVisit: 'भेट बुक करा',
    trackDoses: 'डोस ट्रॅक करा', healthRecords: 'आरोग्य नोंदी', fullHistory: 'संपूर्ण इतिहास',
    // Auth
    signIn: 'साइन इन', register: 'नोंदणी', patient: 'रुग्ण',
    hospitalStaff: 'रुग्णालय कर्मचारी', emailAddress: 'ईमेल पत्ता',
    continueGoogle: 'Google ने सुरू ठेवा', phoneOTP: 'फोन / OTP',
    sendOTP: 'OTP पाठवा', verifyOTP: 'OTP सत्यापित करा',
    signingIn: 'साइन इन होत आहे…', noAccount: 'खाते नाही?',
    low: 'कमी', medium: 'मध्यम', high: 'उच्च', risk: 'धोका',
    save: 'जतन करा', cancel: 'रद्द करा', delete: 'हटवा', edit: 'संपादित करा',
    submit: 'सबमिट करा', back: 'मागे', next: 'पुढे', close: 'बंद करा',
    reviewed: 'तपासले', pending: 'प्रलंबित', confirmed: 'पुष्टी', cancelled: 'रद्द',
    active: 'सक्रिय',
    tips: [
      'दररोज किमान 8 ग्लास पाणी प्या.',
      'रात्री 7–9 तासांची झोप घ्या.',
      'दररोज 30 मिनिटे चालणे हृदयरोगाचा धोका कमी करते.',
      'फळे, भाज्या आणि धान्य असलेला संतुलित आहार घ्या.',
      '40 वर्षांपेक्षा जास्त असाल तर रक्तदाब नियमित तपासा.',
    ],
    symptoms: 'लक्षणे', severity: 'तीव्रता', vitals: 'व्हायटल्स',
    temperature: 'तापमान', heartRate: 'हृदय गती', bloodPressure: 'रक्तदाब',
    notes: 'नोट्स', submitIntake: 'नोंद सादर करा', riskScore: 'धोका स्कोर',
    mild: 'सौम्य', moderate: 'मध्यम', severe: 'गंभीर',
    fullName: 'पूर्ण नाव', age: 'वय', gender: 'लिंग', phone: 'फोन',
    bloodGroup: 'रक्तगट', allergies: 'ऍलर्जी',
    emergencyContact: 'आणीबाणी संपर्क', medicalHistory: 'वैद्यकीय इतिहास',
    locationError: 'तुमचे स्थान मिळवता आले नाही. कृपया लोकेशन अॅक्सेस द्या.',
    noPharmacies: 'कोणतेही औषधालय सापडले नाही. त्रिज्या वाढवा.',
  },
}

export function t(lang, key) {
  return translations[lang]?.[key] ?? translations['en'][key] ?? key
}
