# Palettify — Product Requirements Document

**Project:** Visual Representation of Scent — MSc User Experience Design
**Author:** Thanyakarn Suesatsakul (Ern)
**Date:** June 2026
**Version:** 1.0

---

## 1. Product overview

Palettify is a web-based pilot study tool that collects crossmodal associations between abstract sensory qualities and colours from non-expert participants. The tool is designed to empirically derive a colour mapping system that will inform the design of visual scent representations in the main experiment.

**Tagline:** "Turn your feelings into colours"

---

## 2. Objectives

1. Collect hue data for 4 base sensory qualities (sweet, sour, warm, cool) without any source-based cues.
2. Collect saturation and brightness modifier data (heavy, light, rich, soft, sharp, smooth, bright, dark, dry, wet) to understand how modifiers shift S and B values.
3. Validate that modifier deltas are hue-independent (can be applied across any base colour).
4. Provide an engaging, shareable result (holographic palette card) to motivate participation and aid recruitment.

---

## 3. Target users

- Non-expert participants (no professional background in fragrance, perfumery, colour theory, or sensory science)
- Recruited via social media
- Anonymous participation
- No demographic restrictions (nationality, age 18+)
- Target: 20–30 participants

---

## 4. Design principles

- **No source-based cues:** No mention of scent, smell, fragrance, or specific scent names anywhere in the tool.
- **No researcher bias:** All design decisions in the main experiment will be derived from participant data, not researcher choice.
- **Data-driven:** Every colour mapping rule will be calculated from pilot test results.
- **Engaging:** Participants should feel they are exploring their own sensory personality, not completing a survey.

---

## 5. Theoretical grounding

| Principle | Source |
|-----------|--------|
| Odour–colour crossmodal correspondences exist and are systematic | Spence (2020), Olfactory-colour crossmodal correspondences in art, science, and design |
| Brightness shows the largest differences between fragrances | Spence (2020) |
| Colour saturation correlates with sensory intensity | Saluja & Stevenson (2018); Spence & Levitan (2021) |
| Crossmodal semantic descriptors (warm, bright, heavy, etc.) predict lightness and saturation of matched colours | Crossmodal semantic studies (Spence, 2011) |
| Modifier effects operate on prothetic (intensity) dimensions, which are hue-independent | Spence (2020); Spence & Levitan (2021) |
| Thai speakers engage with olfactory language more frequently than English speakers | Wnuk et al. (2020) |
| Odour–colour associations are mediated by language and are culture-specific | de Valk et al. (2017); Majid et al. (2021) |

---

## 6. User flow

### 6.1 Landing page

- App name: **Palettify**
- Intro text: "Everyone perceives colours and feelings differently. We want to know how you see them." (No mention of scent.)
- Call to action: "Start" button

### 6.2 Step 1 — Base colour selection (4 questions)

Participants see one word at a time and select a colour using an HSB colour wheel.

| Question | Prompt (EN) | Prompt (TH) |
|----------|-------------|-------------|
| 1 | "Choose a colour that feels like: **Sweet**" | "เลือกสีที่คุณรู้สึกว่าเข้ากับ: **หวาน**" |
| 2 | "Choose a colour that feels like: **Sour**" | "เลือกสีที่คุณรู้สึกว่าเข้ากับ: **เปรี้ยว**" |
| 3 | "Choose a colour that feels like: **Warm**" | "เลือกสีที่คุณรู้สึกว่าเข้ากับ: **อุ่น**" |
| 4 | "Choose a colour that feels like: **Cool**" | "เลือกสีที่คุณรู้สึกว่าเข้ากับ: **เย็น**" |

**Interaction:** HSB colour wheel with adjustable hue, saturation, and brightness. Participant confirms selection. Data captured: H° (0–360), S% (0–100), B% (0–100).

### 6.3 Step 2 — Base selection

Display the 4 colours the participant just chose with their labels.

Prompt: "Which one do you like the most?" / "คุณชอบโทนไหนมากที่สุด?"

Participant taps one of the 4 colours. The selected base is used for all modifier questions in round 1.

### 6.4 Step 3 — Modifier questions (10 questions)

The participant's chosen base colour is displayed. They are asked to adjust it based on a combined quality.

| Question | Prompt |
|----------|--------|
| 1 | "[Base] + Heavy" / "[Base] + หนัก" |
| 2 | "[Base] + Light" / "[Base] + เบา" |
| 3 | "[Base] + Rich" / "[Base] + เข้มข้น" |
| 4 | "[Base] + Soft" / "[Base] + นุ่ม" |
| 5 | "[Base] + Sharp" / "[Base] + คม" |
| 6 | "[Base] + Smooth" / "[Base] + ละมุน" |
| 7 | "[Base] + Bright" / "[Base] + สดใส" |
| 8 | "[Base] + Dark" / "[Base] + มืด" |
| 9 | "[Base] + Dry" / "[Base] + แห้ง" |
| 10 | "[Base] + Wet" / "[Base] + ชุ่ม" |

**Interaction:** The base colour is shown on screen. Participant adjusts it via the same HSB colour wheel. The wheel starts at their base colour values. Data captured: modified H° S% B% for each modifier.

### 6.5 Step 4 — Result: Holographic palette card

Display a personalised holographic card showing:
- 4 base colours (with chosen base highlighted)
- Modifier spectrum (10 colour swatches from the chosen base)
- Holographic gradient blending all selected colours

Prompt: "Your sensory palette" / "This is how you see feelings in colour"

Call to action: "Share your palette" and "Want to try another base?"

### 6.6 Repeat rounds (optional)

If participant chooses to continue:
- Display remaining bases (not yet completed)
- Participant selects a new base
- Modifier questions repeat (10 questions) using existing base colour from step 1
- Card updates with additional base spectrum

| Round | Questions | Cumulative total |
|-------|-----------|------------------|
| Round 1 (minimum) | 4 base + 1 choice + 10 modifier = 15 | 15 |
| Round 2 | 10 modifier | 25 |
| Round 3 | 10 modifier | 35 |
| Round 4 (all bases) | 10 modifier | 45 |

---

## 7. Data specification

### 7.1 Data collected per participant

| Data point | Format | Source |
|------------|--------|--------|
| Base: sweet | H° S% B% | Step 1 |
| Base: sour | H° S% B% | Step 1 |
| Base: warm | H° S% B% | Step 1 |
| Base: cool | H° S% B% | Step 1 |
| Chosen base | sweet / sour / warm / cool | Step 2 |
| [Base] + heavy | H° S% B% | Step 3 |
| [Base] + light | H° S% B% | Step 3 |
| [Base] + rich | H° S% B% | Step 3 |
| [Base] + soft | H° S% B% | Step 3 |
| [Base] + sharp | H° S% B% | Step 3 |
| [Base] + smooth | H° S% B% | Step 3 |
| [Base] + bright | H° S% B% | Step 3 |
| [Base] + dark | H° S% B% | Step 3 |
| [Base] + dry | H° S% B% | Step 3 |
| [Base] + wet | H° S% B% | Step 3 |
| Additional rounds (optional) | Same format per round | Step 6 |

### 7.2 Derived data (post-analysis)

| Output | Calculation |
|--------|-------------|
| Mean H° per base quality | Average across all participants |
| Mean S% per base quality | Average across all participants |
| Mean B% per base quality | Average across all participants |
| Delta H° per modifier | Modified H° − Base H° |
| Delta S% per modifier | Modified S% − Base S% |
| Delta B% per modifier | Modified B% − Base B% |
| Cross-base consistency | Compare delta across different bases (from participants who chose different bases) |

### 7.3 Final output: Design system rules

| Rule | Example |
|------|---------|
| Quality → Hue | sweet = H:350°, sour = H:?°, warm = H:20°, cool = H:?° |
| Modifier → Delta S | heavy = S+15%, soft = S−20% |
| Modifier → Delta B | heavy = B−30%, light = B+25% |
| Compound scent colour | warm+heavy = H:20°, S:65+15=80%, B:70−30=40% |

---

## 8. Quality descriptors reference

### 8.1 Hue qualities (determine base colour)

| English | Thai | Pair | Dimension |
|---------|------|------|-----------|
| Sweet | หวาน | ↔ Sour | Taste/sensation |
| Sour | เปรี้ยว | ↔ Sweet | Taste/sensation |
| Warm | อุ่น | ↔ Cool | Temperature |
| Cool | เย็น | ↔ Warm | Temperature |

### 8.2 Modifier qualities (adjust S and B)

| English | Thai | Pair | Dimension |
|---------|------|------|-----------|
| Heavy | หนัก | ↔ Light | Weight |
| Light | เบา | ↔ Heavy | Weight |
| Rich | เข้มข้น | ↔ Soft | Intensity |
| Soft | นุ่ม / อ่อนโยน | ↔ Rich | Intensity |
| Sharp | คม / แหลม | ↔ Smooth | Texture |
| Smooth | ละมุน / เนียน | ↔ Sharp | Texture |
| Bright | สว่าง / สดใส | ↔ Dark | Brightness |
| Dark | มืด / ทึบ | ↔ Bright | Brightness |
| Dry | แห้ง / กร้าน | ↔ Wet | Moisture |
| Wet | เปียก / ชุ่ม | ↔ Dry | Moisture |

---

## 9. Key assumptions and limitations

| Assumption | Justification | Limitation |
|------------|---------------|------------|
| Modifier deltas are hue-independent | Prothetic dimension theory (Spence, 2020): intensity-based mappings operate independently of quality type | Not fully validated across all base-modifier combinations; cross-base consistency is checked via natural distribution of base choices |
| Abstract quality descriptors are understood universally | Sweet, warm, cool, etc. are common crossmodal terms used across sensory domains | Thai translations may carry slightly different connotations |
| Pilot and main experiment participants are separate | Recruited separately via social media; some overlap may occur | Overlap is mitigated by different task framing (abstract colour vs scent representation) and time gap between studies |
| No source-based bias in pilot | No mention of scent, no scent names, no source imagery | Participants may still internally associate qualities with source objects |

---

## 10. Integration with main experiment

### 10.1 How pilot data informs design

| Main experiment element | Informed by |
|-------------------------|-------------|
| Colour of visual representation | Hue from base quality + delta from modifiers |
| Saturation of visual representation | Delta S from modifiers |
| Brightness of visual representation | Delta B from modifiers |
| Simple vs complex scent difference | Simple: 1 dominant quality colour; Complex: multiple quality colours blended proportionally |
| Scent quality profiles | Fragrantica accords (triangulated with brand description + researcher verification) |

### 10.2 Design stimuli creation flow

```
Fragrantica accords → Define scent quality profile (e.g., warm 60% + sweet 30% + dry 10%)
                ↓
Pilot test data → Map each quality to HSB values
                ↓
Apply modifier deltas → Adjust S and B based on scent character
                ↓
Compose visual → Dominant quality = primary colour, secondary = accent colour
```

---

## 11. Technical requirements

| Requirement | Specification |
|-------------|--------------|
| Platform | Web-based (responsive, mobile-friendly) |
| Colour input | HSB colour wheel with real-time preview |
| Data storage | Anonymous, no personal data collected |
| Data export | CSV with columns: participant_id, question, H, S, B, timestamp |
| Hosting | To be determined |
| Browser support | Chrome, Safari, Firefox (latest) |
| Language | Bilingual (English / Thai), user selectable |
| Estimated completion time | 5–8 minutes (1 round), 15–20 minutes (all 4 rounds) |

---

## 12. Success metrics

| Metric | Target |
|--------|--------|
| Completed participants (minimum 1 round) | 20–30 |
| Completion rate | > 80% |
| Participants completing 2+ rounds | > 50% |
| Cross-base delta consistency (SD) | Low variance across bases for same modifier |
| Shareable card engagement | Participants share card on social media → organic recruitment |
