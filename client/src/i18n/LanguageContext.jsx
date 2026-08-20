import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // TopBar & System
    topbarTitle: 'AI-ASSISTED DRUG-MARKET INVESTIGATION SYSTEM',
    demoMode: 'DEMO MODE',
    liveTelegram: 'LIVE TELEGRAM',
    operational: 'Operational',
    initializing: 'Initializing...',

    // Navigation
    navCore: 'CORE INTELLIGENCE',
    navDashboard: 'Dashboard',
    navMessages: 'Messages Triage',
    navVendors: 'Vendor Directory',
    navCorrelation: 'CORRELATION & ANALYTICS',
    navAnalysis: 'Analysis & Timeline',
    navGraph: 'Link Graph',
    navStylometry: 'Stylometry Engine',
    navWallets: 'Crypto Wallets',
    botOnline: 'LIVE TELEGRAM BOT ONLINE',
    engineActive: 'Engine Active',
    steinPlatform: 'STEIN Platform',

    // Risk & Status Badges
    highRisk: 'HIGH RISK',
    mediumRisk: 'MEDIUM RISK',
    lowRisk: 'LOW RISK',
    suspicious: 'SUSPICIOUS',
    review: 'NEEDS REVIEW',
    benign: 'BENIGN',
    badgeLive: 'LIVE',
    badgeDemo: 'DEMO',

    // Dashboard Page
    dashTitle: 'Investigation Dashboard',
    dashSubtitle: 'Telegram Drug-Market Intelligence & Correlation System',
    statTotalMsgs: 'TOTAL INGESTED',
    statTotalMsgsSub: 'Telegram Feeds & Messages',
    statVendors: 'TRACKED VENDORS',
    statVendorsSub: 'Unique Vendor Identities',
    statReports: 'SIGNED REPORTS',
    statReportsSub: 'SHA-256 Forensic Packages',
    seedBtn: 'Seed Demo Scenario',
    recentFeeds: 'Recent Ingested Telegram Feeds',
    teleMonitor: 'Telegram Channel Monitor',

    // Messages Page
    msgTitle: 'Ingested Messages Triage',
    msgSubtitle: 'Real-time rule engine & zero-shot classifier triage queue',
    ingestFormTitle: 'INGEST SYNTHETIC TEST MESSAGE',
    senderPlaceholder: "Sender (e.g. 'Vendor_Alpha')",
    msgPlaceholder: 'Enter raw message text...',
    ingestBtn: 'Ingest & Classify',
    searchMsgPlaceholder: 'Search messages, decoded text, or sender...',
    allClassifications: 'All Classifications',
    suspiciousOnly: 'Suspicious Only',
    needsReview: 'Needs Review',
    benignOnly: 'Benign',
    
    // Table Headers & Actions
    thSource: 'SOURCE',
    thVendor: 'VENDOR IDENTITY',
    thMessageContent: 'MESSAGE CONTENT',
    thRisk: 'CLASSIFICATION & RISK',
    thTimestamp: 'TIMESTAMP',
    thAction: 'ACTION',
    btnDetails: 'Details',
    btnHide: 'Hide',
    whyFlagFired: 'EXPLAINABLE AI: WHY THIS FLAG FIRED',
    aiSummary: 'AI Reasoning Summary:',

    // Vendors Page
    vendorTitle: 'Tracked Vendor Directory & Profiles',
    vendorSubtitle: 'Aggregated seller profiles, alias clusters, and stylometric fingerprints',
    styloCompBtn: 'Stylometry Comparison',
    knownAliasesHeader: 'KNOWN ALIASES:',
    noneRecorded: 'None recorded',
    messagesCount: 'MESSAGES',
    walletsCount: 'WALLETS',
    firstSeen: 'First Seen',
    fullDossier: 'Full Dossier →',
    exportDossier: 'Export Official Dossier (PDF)',
    backToVendors: 'Back to Vendor Directory',

    // Analysis Page
    analysisTitle: 'Temporal Intelligence & Threat Velocity Analysis',
    analysisSubtitle: 'Dynamic time-series activity correlation & multi-timeframe threat velocity analytics',
    timeframe: 'Timeframe',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    suspiciousCount: 'Suspicious Count',
    threatVelocity: 'Threat Velocity State',

    // Stylometry Page
    styloTitle: 'Stylometric Writing-Style Alias Relinking Engine',
    styloSubtitle: 'Cosine similarity vector matching based on punctuation, n-grams & function word frequencies',
    targetAuthorA: 'Target Author Persona A',
    targetAuthorB: 'Target Author Persona B',
    compareStyles: 'Compute Writing-Style Similarity',
    matchScore: 'ALIAS MATCH PROBABILITY',

    // Graph Page
    graphTitle: 'Multi-Node Intelligence Correlation Link Graph',
    graphSubtitle: 'Topological network linking Vendors, Aliases, Telegram Messages & Crypto Wallets',
    searchNodePlaceholder: 'Search graph nodes by name or address...',

    // Wallets Page
    walletsTitle: 'Crypto Wallet Risk & On-Chain Intelligence',
    walletsSubtitle: 'Etherscan transaction velocity & illicit payment profile tracking',
  },
  hi: {
    // TopBar & System
    topbarTitle: 'एआई-सहायता प्राप्त ड्रग-मार्केट जांच प्रणाली',
    demoMode: 'डेमो मोड',
    liveTelegram: 'लाइव टेलीग्राम',
    operational: 'सक्रिय (ऑपरेशनल)',
    initializing: 'प्रारंभ हो रहा है...',

    // Navigation
    navCore: 'मुख्य खुफिया मंच',
    navDashboard: 'डैशबोर्ड',
    navMessages: 'संदेश जांच',
    navVendors: 'विक्रेता निर्देशिका',
    navCorrelation: 'संबंध और विश्लेषण',
    navAnalysis: 'विश्लेषण और समय-सीमा',
    navGraph: 'लिंक ग्राफ',
    navStylometry: 'लेखन शैली इंजन',
    navWallets: 'क्रिप्टो वॉलेट',
    botOnline: 'लाइव टेलीग्राम बॉट सक्रिय',
    engineActive: 'इंजन सक्रिय',
    steinPlatform: 'स्टीन प्लेटफॉर्म',

    // Risk & Status Badges
    highRisk: 'उच्च जोखिम',
    mediumRisk: 'मध्यम जोखिम',
    lowRisk: 'कम जोखिम',
    suspicious: 'संदिग्ध',
    review: 'समीक्षा आवश्यक',
    benign: 'सामान्य',
    badgeLive: 'लाइव',
    badgeDemo: 'डेमो',

    // Dashboard Page
    dashTitle: 'जांच डैशबोर्ड',
    dashSubtitle: 'टेलीग्राम ड्रग-मार्केट इंटेलिजेंस एंड कोरिलेशन सिस्टम',
    statTotalMsgs: 'कुल एकत्र संदेश',
    statTotalMsgsSub: 'टेलीग्राम फ़ीड और संदेश',
    statVendors: 'ट्रैक किए गए विक्रेता',
    statVendorsSub: 'अनूठी विक्रेता पहचान',
    statReports: 'हस्ताक्षरित रिपोर्ट',
    statReportsSub: 'SHA-256 फोरेंसिक पैकेज',
    seedBtn: 'डेमो परिदृश्य लोड करें',
    recentFeeds: 'हाल ही में एकत्र किए गए टेलीग्राम संदेश',
    teleMonitor: 'टेलीग्राम चैनल मॉनिटर',

    // Messages Page
    msgTitle: 'एकत्रित संदेशों की जांच (ट्राइएज)',
    msgSubtitle: 'रियल-टाइम नियम इंजन और शून्य-शॉट वर्गीकरण कतार',
    ingestFormTitle: 'परीक्षण संदेश इनपुट करें',
    senderPlaceholder: "प्रेषक (जैसे 'Vendor_Alpha')",
    msgPlaceholder: 'कच्चा संदेश टेक्स्ट दर्ज करें...',
    ingestBtn: 'दर्ज करें और वर्गीकृत करें',
    searchMsgPlaceholder: 'संदेश, डिकोड किए गए टेक्स्ट या प्रेषक को खोजें...',
    allClassifications: 'सभी वर्गीकरण',
    suspiciousOnly: 'केवल संदिग्ध',
    needsReview: 'समीक्षा आवश्यक',
    benignOnly: 'सामान्य',

    // Table Headers & Actions
    thSource: 'स्रोत',
    thVendor: 'विक्रेता पहचान',
    thMessageContent: 'संदेश सामग्री',
    thRisk: 'वर्गीकरण और जोखिम',
    thTimestamp: 'समय संचित',
    thAction: 'कार्रवाई',
    btnDetails: 'विवरण',
    btnHide: 'छिपाएं',
    whyFlagFired: 'व्याख्यात्मक AI: यह फ्लैग क्यों लगाया गया',
    aiSummary: 'AI तर्क सारांश:',

    // Vendors Page
    vendorTitle: 'ट्रैक की गई विक्रेता निर्देशिका और प्रोफ़ाइल',
    vendorSubtitle: 'विक्रेता प्रोफ़ाइल, उपनाम क्लस्टर और लेखन शैली फिंगरप्रिंट',
    styloCompBtn: 'लेखन शैली तुलना',
    knownAliasesHeader: 'ज्ञात उपनाम:',
    noneRecorded: 'कोई उपनाम दर्ज नहीं',
    messagesCount: 'संदेश',
    walletsCount: 'वॉलेट',
    firstSeen: 'प्रथम बार देखा गया',
    fullDossier: 'पूर्ण डोजियर →',
    exportDossier: 'आधिकारिक डोजियर (PDF) डाउनलोड करें',
    backToVendors: 'विक्रेता निर्देशिका पर लौटें',

    // Analysis Page
    analysisTitle: 'समय-आधारित खुफिया और खतरा गति विश्लेषण',
    analysisSubtitle: 'गतिशील समय-श्रृंखला गतिविधि और बहु-समयसीमा खतरा विश्लेषण',
    timeframe: 'समयसीमा',
    daily: 'दैनिक',
    weekly: 'साप्ताहिक',
    monthly: 'मासिक',
    yearly: 'वार्षिक',
    suspiciousCount: 'संदिग्ध संख्या',
    threatVelocity: 'खतरा गति स्थिति',

    // Stylometry Page
    styloTitle: 'लेखन शैली उपनाम मिलान इंजन',
    styloSubtitle: 'विराम चिन्ह, एन-ग्राम और शब्द आवृत्तियों के आधार पर कोसाइन समानता मिलान',
    targetAuthorA: 'लक्षित लेखक प्रोफ़ाइल A',
    targetAuthorB: 'लक्षित लेखक प्रोफ़ाइल B',
    compareStyles: 'लेखन शैली समानता की गणना करें',
    matchScore: 'उपनाम मिलान संभावना',

    // Graph Page
    graphTitle: 'मल्टी-नोड खुफिया संबंध लिंक ग्राफ',
    graphSubtitle: 'विक्रेताओं, उपनामों, संदेशों और क्रिप्टो वॉलेट को जोड़ने वाला नेटवर्क ग्राफ',
    searchNodePlaceholder: 'नाम या पते से ग्राफ नोड खोजें...',

    // Wallets Page
    walletsTitle: 'क्रिप्टो वॉलेट जोखिम और ऑन-चेन खुफिया',
    walletsSubtitle: 'इथरस्कैन लेनदेन गति और अवैध भुगतान प्रोफाइल ट्रैकिंग',
  },
  pa: {
    // TopBar & System
    topbarTitle: 'AI-ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਡਰੱਗ-ਮਾਰਕੀਟ ਜਾਂਚ ਪ੍ਰਣਾਲੀ',
    demoMode: 'ਡੈਮੋ ਮੋਡ',
    liveTelegram: 'ਲਾਇਵ ਟੈਲੀਗ੍ਰਾਮ',
    operational: 'ਕਾਰਜਸ਼ੀਲ (ਆਪ੍ਰੇਸ਼ਨਲ)',
    initializing: 'ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ...',

    // Navigation
    navCore: 'ਮੁੱਖ ਖੁਫੀਆ ਨੈੱਟਵਰਕ',
    navDashboard: 'ਡੈਸ਼ਬੋਰਡ',
    navMessages: 'ਸੁਨੇਹਾ ਟ੍ਰਾਈਏਜ',
    navVendors: 'ਵਿਕਰੇਤਾ ਡਾਇਰੈਕਟਰੀ',
    navCorrelation: 'ਸਬੰਧ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ',
    navAnalysis: 'ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਸਮਾਂ-ਰੇਖਾ',
    navGraph: 'ਲਿੰਕ ਗ੍ਰਾਫ਼',
    navStylometry: 'ਲਿਖਣ-ਸ਼ੈਲੀ ਇੰਜਣ',
    navWallets: 'ਕ੍ਰਿਪਟੋ ਵਾਲਿਟ',
    botOnline: 'ਲਾਇਵ ਟੈਲੀਗ੍ਰਾਮ ਬੋਟ ਸਰਗਰਮ',
    engineActive: 'ਇੰਜਣ ਸਰਗਰਮ',
    steinPlatform: 'ਸਟੀਨ ਪਲੇਟਫਾਰਮ',

    // Risk & Status Badges
    highRisk: 'ਉੱਚ ਜੋਖਮ',
    mediumRisk: 'ਦਰਮਿਆਨਾ ਜੋਖਮ',
    lowRisk: 'ਘੱਟ ਜੋਖਮ',
    suspicious: 'ਸ਼ੱਕੀ',
    review: 'ਸਮੀਖਿਆ ਦੀ ਲੋੜ',
    benign: 'ਸਧਾਰਨ',
    badgeLive: 'ਲਾਇਵ',
    badgeDemo: 'ਡੈਮੋ',

    // Dashboard Page
    dashTitle: 'ਜਾਂਚ ਡੈਸ਼ਬੋਰਡ',
    dashSubtitle: 'ਟੈਲੀਗ੍ਰਾਮ ਡਰੱਗ-ਮਾਰਕੀਟ ਇੰਟੈਲੀਜੈਂਸ ਐਂਡ ਕੋਰਲੇਸ਼ਨ ਸਿਸਟਮ',
    statTotalMsgs: 'ਕੁੱਲ ਇਕੱਤਰ ਸੁਨੇਹੇ',
    statTotalMsgsSub: 'ਟੈਲੀਗ੍ਰਾਮ ਫੀਡਸ ਅਤੇ ਸੁਨੇਹੇ',
    statVendors: 'ਟ੍ਰੈਕ ਕੀਤੇ ਵਿਕਰੇਤਾ',
    statVendorsSub: 'ਵਿਲੱਖਣ ਵਿਕਰੇਤਾ ਪਛਾਣਾਂ',
    statReports: 'ਦਸਤਖਤ ਕੀਤੇ ਰਿਪੋਰਟਾਂ',
    statReportsSub: 'SHA-256 ਫੋਰੈਂਸਿਕ ਪੈਕੇਜ',
    seedBtn: 'ਡੈਮੋ ਡਾਟਾਸੈੱਟ ਲੋਡ ਕਰੋ',
    recentFeeds: 'ਹਾਲ ਹੀ ਵਿੱਚ ਪ੍ਰਾਪਤ ਹੋਏ ਟੈਲੀਗ੍ਰਾਮ ਸੁਨੇਹੇ',
    teleMonitor: 'ਟੈਲੀਗ੍ਰਾਮ ਚੈਨਲ ਮਾਨੀਟਰ',

    // Messages Page
    msgTitle: 'ਇਕੱਤਰ ਕੀਤੇ ਸੁਨੇਹਿਆਂ ਦੀ ਜਾਂਚ (ਟ੍ਰਾਈਏਜ)',
    msgSubtitle: 'ਰਿਅਲ-ਟਾਈਮ ਨਿਯਮ ਇੰਜਣ ਅਤੇ AI ਵਰਗੀਕਰਨ ਲਾਈਨ',
    ingestFormTitle: 'ਟੈਸਟ ਸੁਨੇਹਾ ਇਨਪੁਟ ਕਰੋ',
    senderPlaceholder: "ਭੇਜਣ ਵਾਲਾ (ਜਿਵੇਂ 'Vendor_Alpha')",
    msgPlaceholder: 'ਕੱਚਾ ਸੁਨੇਹਾ ਟੈਕਸਟ ਦਰਜ ਕਰੋ...',
    ingestBtn: 'ਦਰਜ ਕਰੋ ਅਤੇ ਵਰਗੀਕ੍ਰਿਤ ਕਰੋ',
    searchMsgPlaceholder: 'ਸੁਨੇਹੇ, ਡੀਕੋਡ ਕੀਤੇ ਟੈਕਸਟ ਜਾਂ ਭੇਜਣ ਵਾਲੇ ਦੀ ਖੋਜ ਕਰੋ...',
    allClassifications: 'ਸਾਰੇ ਵਰਗੀਕਰਨ',
    suspiciousOnly: 'ਕੇਵਲ ਸ਼ੱਕੀ',
    needsReview: 'ਸਮੀਖਿਆ ਦੀ ਲੋੜ',
    benignOnly: 'ਸਧਾਰਨ',

    // Table Headers & Actions
    thSource: 'ਸਰੋਤ',
    thVendor: 'ਵਿਕਰੇਤਾ ਪਛਾਣ',
    thMessageContent: 'ਸੁਨੇਹੇ ਦੀ ਸਮੱਗਰੀ',
    thRisk: 'ਵਰਗੀਕਰਨ ਅਤੇ ਜੋਖਮ',
    thTimestamp: 'ਸਮਾਂ',
    thAction: 'ਕਾਰਵਾਈ',
    btnDetails: 'ਵੇਰਵੇ',
    btnHide: 'ਛੁਪਾਓ',
    whyFlagFired: 'ਸਪੱਸ਼ਟ AI: ਇਹ ਫਲੈਗ ਕਿਉਂ ਲਗਾਇਆ ਗਿਆ',
    aiSummary: 'AI ਤਰਕ ਦਾ ਸਾਰ:',

    // Vendors Page
    vendorTitle: 'ਟ੍ਰੈਕ ਕੀਤੀ ਵਿਕਰੇਤਾ ਡਾਇਰੈਕਟਰੀ ਅਤੇ ਪ੍ਰੋਫਾਈਲ',
    vendorSubtitle: 'ਵਿਕਰੇਤਾ ਪ੍ਰੋਫਾਈਲ, ਉਪਨਾਮ ਅਤੇ ਲਿਖਣ ਸ਼ੈਲੀ ਫਿੰਗਰਪ੍ਰਿੰਟਸ',
    styloCompBtn: 'ਲਿਖਣ-ਸ਼ੈਲੀ ਮਿਲਾਨ',
    knownAliasesHeader: 'ਜਾਣੇ ਜਾਂਦੇ ਉਪਨਾਮ:',
    noneRecorded: 'ਕੋਈ ਉਪਨਾਮ ਦਰਜ ਨਹੀਂ',
    messagesCount: 'ਸੁਨੇਹੇ',
    walletsCount: 'ਵਾਲਿਟ',
    firstSeen: 'ਪਹਿਲੀ ਵਾਰ ਦੇਖਿਆ ਗਿਆ',
    fullDossier: 'ਪੂਰਾ ਡੋਜ਼ੀਅਰ →',
    exportDossier: 'ਅਧਿਕਾਰਤ ਡੋਜ਼ੀਅਰ (PDF) ਡਾਊਨਲੋਡ ਕਰੋ',
    backToVendors: 'ਵਿਕਰੇਤਾ ਡਾਇਰੈਕਟਰੀ ਤੇ ਵਾਪਸ ਜਾਓ',

    // Analysis Page
    analysisTitle: 'ਸਮਾਂ-ਆਧਾਰਿਤ ਖੁਫੀਆ ਅਤੇ ਖਤਰੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ',
    analysisSubtitle: 'ਗਤੀਸ਼ੀਲ ਸਮਾਂ-ਲੜੀ ਗਤੀਵਿਧੀ ਅਤੇ ਬਹੁ-ਸਮਾਂ-ਸੀਮਾ ਖਤਰੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ',
    timeframe: 'ਸਮਾਂ-ਸੀਮਾ',
    daily: 'ਰੋਜ਼ਾਨਾ',
    weekly: 'ਹਫ਼ਤਾਵਾਰੀ',
    monthly: 'ਮਹੀਨਾਵਾਰ',
    yearly: 'ਸਾਲਾਨਾ',
    suspiciousCount: 'ਸ਼ੱਕੀ ਗਿਣਤੀ',
    threatVelocity: 'ਖਤਰੇ ਦੀ ਗਤੀ',

    // Stylometry Page
    styloTitle: 'ਲਿਖਣ-ਸ਼ੈਲੀ ਉਪਨਾਮ ਮਿਲਾਨ ਇੰਜਣ',
    styloSubtitle: 'ਵਿਰਾਮ ਚਿੰਨ੍ਹ, ਐਨ-ਗ੍ਰਾਮ ਅਤੇ ਸ਼ਬਦ ਆਵਿਰਤੀਆਂ ਦੇ ਆਧਾਰ ਤੇ ਲਿਖਤ ਮਿਲਾਨ',
    targetAuthorA: 'ਟਾਰਗੇਟ ਲੇਖਕ ਪ੍ਰੋਫਾਈਲ A',
    targetAuthorB: 'ਟਾਰਗੇਟ ਲੇਖਕ ਪ੍ਰੋਫਾਈਲ B',
    compareStyles: 'ਲਿਖਣ ਸ਼ੈਲੀ ਮਿਲਾਨ ਦੀ ਗਣਨਾ ਕਰੋ',
    matchScore: 'ਉਪਨਾਮ ਮਿਲਾਨ ਦੀ ਸੰਭਾਵਨਾ',

    // Graph Page
    graphTitle: 'ਮਲਟੀ-ਨੋਡ ਖੁਫੀਆ ਲਿੰਕ ਗ੍ਰਾਫ਼',
    graphSubtitle: 'ਵਿਕਰੇਤਾਵਾਂ, ਉਪਨਾਮਾਂ, ਸੁਨੇਹਿਆਂ ਅਤੇ ਕ੍ਰਿਪਟੋ ਵਾਲਿਟਾਂ ਨੂੰ ਜੋੜਨ ਵਾਲਾ ਨੈੱਟਵਰਕ ਗ੍ਰਾਫ਼',
    searchNodePlaceholder: 'ਨਾਮ ਜਾਂ ਪਤੇ ਦੁਆਰਾ ਨੋਡ ਖੋਜੋ...',

    // Wallets Page
    walletsTitle: 'ਕ੍ਰਿਪਟੋ ਵਾਲਿਟ ਜੋਖਮ ਅਤੇ ਆਨ-ਚੇਨ ਖੁਫੀਆ',
    walletsSubtitle: 'ਇਥਰਸਕੈਨ ਲੈਣ-ਦੇਣ ਗਤੀ ਅਤੇ ਗੈਰ-ਕਾਨੂੰਨੀ ਭੁਗਤਾਨ ਪ੍ਰੋਫਾਈਲ ਟ੍ਰੈਕਿੰਗ',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('stein_lang') || 'en');

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('stein_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
