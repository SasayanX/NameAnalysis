# 🎯 Mainichi AI Name Analysis - Project Roadmap

## 📅 Update History
- **2025-01-26**: Initial version created
- **Phase 2 Refactoring**: Completed ✅
- **TWA Preparation**: 90% Complete ✅

---

## 🎮 **Phase 3: User Engagement Enhancement**

### **🎯 Goals**
- Build daily login incentive system
- Natural marketing through SNS sharing
- Continuous usage through omamori collection

### **📋 Key Features**

#### **1. Point Exchange System**
- **Basic Design**: No gacha elements, point exchange only
- **Point Earning Methods**:
  - Daily login: 10pt
  - Consecutive login: 3 days→50pt, 7 days→100pt, 14 days→200pt, 30 days→500pt
  - Name analysis execution: 5pt
  - Result sharing: 20pt
  - Weekly bonus: 100pt

#### **2. Omamori System**
- **Rarity** (Price-based):
  - Basic omamori: 50pt (Brown theme, basic fortune boost)
  - Lucky omamori: 200pt (Gold theme, money/work fortune boost)
  - Element omamori: 500pt (Five elements colors, element balance)
  - Kinamei Ryu omamori: 1000pt (Purple/gold, all fortune boost)

#### **3. SNS Share Feature**
- **Share Targets**:
  - Name analysis results: 20pt
  - Omamori images: 30pt
  - Special results: 50pt (Great fortune, all great fortune, Kinamei Ryu omamori)
- **Supported Platforms**: Twitter, Facebook, LINE, Instagram, TikTok
- **Viral Strategy**: Beautiful image generation, appropriate hashtags, buzz-worthy elements

---

## 📱 **Phase 4: TWA Implementation**

### **🎯 Goals**
- Publish as Android app on Google Play Store
- Native app experience leveraging PWA features

### **📋 Implementation Items**

#### **1. Digital Asset Links Setup**
- Create `.well-known/assetlinks.json` file
- Obtain SHA256 fingerprint from Android Studio
- Deploy to web server

#### **2. Android App Creation**
- Use **TWA Builder** or **Bubblewrap**
- Package name: `com.yourcompany.mainichi-ai-name-analysis`
- Required permissions and settings

#### **3. Google Play Console Preparation**
- Create app description
- Take screenshots (various device sizes)
- Privacy policy (existing)
- Age restriction settings

---

## 🎨 **Phase 5: Omamori Image Generation System**

### **🎯 Goals**
- Automatic generation of high-quality omamori images
- Personalization features
- Special edition with Kinamei Ryu signature

### **📋 Implementation Items**

#### **1. Image Generation Engine**
- Image generation using Canvas API
- Template system
- Personalization features

#### **2. Omamori Designs**
- **Basic omamori**: Simple Japanese-style design
- **Lucky omamori**: Gold accents
- **Element omamori**: Five elements colors (red, blue, yellow, white, black)
- **Kinamei Ryu omamori**: Special signature, purple/gold

#### **3. Special Features**
- **Omamori Collection**: List of acquired omamori
- **Effect Description**: Fortune effects of each omamori
- **Share Feature**: Share omamori on SNS

---

## 🚀 **Phase 6: Engagement Feature Enhancement**

### **🎯 Goals**
- Promote continuous user usage
- Enhance social features
- Host special events

### **📋 Implementation Items**

#### **1. Collection Elements**
- **Omamori Encyclopedia**: List of acquired omamori
- **Progress Display**: Points needed for next omamori
- **Rarity Display**: Rarity of each omamori

#### **2. Social Features**
- **Omamori Sharing**: Show off on SNS
- **Point Rankings**: Weekly/monthly rankings
- **Omamori Bragging**: Share special omamori

#### **3. Special Events**
- **Limited-time omamori**: Special designs
- **Double Points**: Point multiplier on specific days
- **Seasonal omamori**: Special editions for each season
- **Share Campaigns**: Limited-time share bonuses

---

## 💰 **Phase 7: Monetization Strategy**

### **🎯 Goals**
- Build sustainable revenue model
- Payment design that doesn't harm user experience

### **📋 Implementation Items**

#### **1. Payment Elements**
- **Point Purchase**: 100 yen = 100 points
- **Special Packs**: Cost-effective point sets
- **Monthly Pass**: Daily bonus points

#### **2. Free Elements**
- **Daily Login**: Guaranteed point earning
- **Consecutive Login**: Bonus points
- **Free Omamori**: Basic omamori can be acquired for free

#### **3. Analytics Features**
- **User Behavior Analysis**: Understanding usage patterns
- **Revenue Analysis**: Measuring payment rate/ARPU
- **A/B Testing**: Verifying optimal payment design

---

## 🔧 **Technical Implementation Details**

### **📁 File Structure**
```
lib/
├── point-system.ts          # Point management system
├── omamori-generator.ts     # Omamori image generation
├── share-manager.ts         # SNS share management
└── engagement-tracker.ts    # Engagement tracking

components/
├── point-display.tsx        # Point display
├── omamori-collection.tsx   # Omamori collection
├── share-buttons.tsx        # Share buttons
└── login-bonus.tsx          # Login bonus

app/
├── omamori/                 # Omamori page
├── points/                  # Points page
└── collection/              # Collection page
```

### **🗄️ Data Structure**
```typescript
interface UserProfile {
  id: string
  points: number
  omamoriCollection: Omamori[]
  loginStreak: number
  lastLoginDate: Date
  shareCount: number
}

interface Omamori {
  id: string
  name: string
  rarity: 'basic' | 'lucky' | 'element' | 'special'
  imageUrl: string
  description: string
  effect: string
  price: number
  acquiredDate: Date
}

interface ShareContent {
  title: string
  description: string
  imageUrl: string
  hashtags: string[]
  url: string
}
```

---

## 📊 **Success Metrics (KPI)**

### **🎯 Engagement Metrics**
- **DAU (Daily Active Users)**: Daily active user count
- **MAU (Monthly Active Users)**: Monthly active user count
- **Session Duration**: Average session duration
- **Page Views**: Page views per session

### **🎮 Point System Metrics**
- **Point Earning Rate**: User point earning rate
- **Omamori Exchange Rate**: Exchange rate from points to omamori
- **Consecutive Login Rate**: Consecutive login continuation rate

### **📱 SNS Share Metrics**
- **Share Rate**: Share rate after result display
- **Inflow Count**: New users from sharing
- **Engagement**: Likes/retweets count

### **💰 Revenue Metrics**
- **Payment Rate**: Ratio of paid users
- **ARPU**: Average revenue per user
- **LTV**: Customer lifetime value

---

## 🗓️ **Implementation Schedule**

### **Phase 3: User Engagement Enhancement**
- **Week 1-2**: Point system implementation
- **Week 3-4**: Omamori system implementation
- **Week 5-6**: SNS share feature implementation

### **Phase 4: TWA Implementation**
- **Week 7-8**: Digital Asset Links setup
- **Week 9-10**: Android app creation
- **Week 11-12**: Google Play application

### **Phase 5: Omamori Image Generation**
- **Week 13-14**: Image generation engine implementation
- **Week 15-16**: Omamori design creation

### **Phase 6: Engagement Feature Enhancement**
- **Week 17-18**: Collection elements implementation
- **Week 19-20**: Social features implementation

### **Phase 7: Monetization Strategy**
- **Week 21-22**: Payment system implementation
- **Week 23-24**: Analytics features implementation

---

## 🎯 **Next Actions**

### **Immediately Implementable**
1. **Point System**: Local storage based
2. **Basic Share Feature**: Support for each platform
3. **Omamori Display**: Basic image display

### **During Operation Testing**
1. **Consecutive Login Bonus**: User behavior analysis
2. **Share Effect Measurement**: Viral effect verification
3. **Omamori Demand Survey**: User reaction confirmation

### **TWA Preparation**
1. **Digital Asset Links**: Technical requirements confirmation
2. **Android Studio**: Development environment preparation
3. **Google Play**: Application requirements confirmation

---

## 📝 **Notes & Memos**

### **Important Decisions**
- ✅ Exclude gacha elements, point exchange only
- ✅ Earn points through SNS sharing (viral strategy)
- ✅ Kinamei Ryu signature omamori (special reward)
- ✅ Android app through TWA implementation

### **Technical Considerations**
- Data management with local storage
- Image generation with Canvas API
- API limitations of each SNS platform
- Performance optimization for TWA

### **Legal Considerations**
- Privacy policy (existing)
- Terms of service (existing)
- Specified Commercial Transactions Act (existing)
- Gacha regulation compliance (not needed)

---

**Last Updated**: 2025-01-26  
**Created By**: AI Assistant  
**Status**: Planning Complete, Implementation Ready 🚀
