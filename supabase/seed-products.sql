-- ============================================================
-- MUFASA Gadgets — Product Seed
-- Run this ONCE in your Supabase SQL editor.
-- Selling price = purchase cost × 3.80  (lands at 100% markup
-- on full landing cost inclusive of all overheads).
-- ============================================================

-- ── 1. New categories ────────────────────────────────────────
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Tablets',    'tablets',    'Android and Windows tablets',                    2),
  ('Electronics','electronics','Drones, printers, inverters and GPS devices',    7),
  ('Smart Home', 'smart-home', 'Smart locks, automation and IoT devices',        8),
  ('Tools',      'tools',      'Repair kits, screwdrivers and precision tools',  9)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. Products ──────────────────────────────────────────────
-- tags: bestseller | premium | hightech | accessories
-- These map to the 5 home-page sections.

INSERT INTO public.products
  (name, slug, description, short_description, price, category_id,
   stock_quantity, is_featured, is_active, tags, specs)
VALUES

-- TABLETS
('12" Android Tablet Pro 14',
 '12-android-tab-pro14',
 'High-performance 12-inch Android tablet with octa-core processor, 128GB storage and 4G LTE connectivity. Sleek metal body, vivid IPS display, and 7000mAh battery for all-day performance.',
 'Octa-core, 128GB, 4G LTE — your productivity powerhouse',
 199.00,
 (SELECT id FROM public.categories WHERE slug = 'tablets'),
 5, true, true, ARRAY['premium','hightech'],
 '{"display":"12 inch IPS","storage":"128GB","ram":"6GB","connectivity":"4G LTE","battery":"7000mAh","os":"Android 13"}'::jsonb),

('10" Android Tablet',
 '10-android-tab',
 'Compact 10-inch Android tablet perfect for entertainment, browsing and light productivity. Dual-SIM, expandable storage and a long-lasting battery.',
 'Dual-SIM 10-inch Android tablet for everyday use',
 137.00,
 (SELECT id FROM public.categories WHERE slug = 'tablets'),
 10, false, true, ARRAY['hightech'],
 '{"display":"10 inch IPS","storage":"64GB","ram":"4GB","connectivity":"4G LTE","battery":"6000mAh","os":"Android 13"}'::jsonb),

-- CABLES
('100W USB-C Charging Cable 1m',
 '100w-usb-c-cable-1m',
 'Premium 100W USB-C to USB-C fast-charging cable. Nylon-braided, supports PD 3.0, compatible with laptops, tablets and phones. Rated for 10,000+ bends.',
 'Nylon-braided 100W PD fast-charging cable',
 4.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 25, false, true, ARRAY['bestseller','accessories'],
 '{"length":"1m","wattage":"100W","standard":"PD 3.0","material":"Nylon braid"}'::jsonb),

('Type-C Braided Cable 2m',
 'type-c-braided-2m',
 'Heavy-duty 2-metre USB-C braided cable for extended reach charging and data transfer. Supports fast charging and 480Mbps data.',
 '2-metre braided USB-C cable for extended reach',
 7.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 10, false, true, ARRAY['bestseller','accessories'],
 '{"length":"2m","wattage":"60W","material":"Nylon braid"}'::jsonb),

('Type-C Braided Cable 1.5m',
 'type-c-braided-1-5m',
 'Mid-length 1.5-metre USB-C braided cable — the perfect balance between desk use and reach. Fast charge and data compatible.',
 '1.5-metre braided USB-C cable',
 5.50,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 10, false, true, ARRAY['bestseller','accessories'],
 '{"length":"1.5m","wattage":"60W","material":"Nylon braid"}'::jsonb),

('Type-C Braided Cable 5m',
 'type-c-braided-5m',
 'Extra-long 5-metre USB-C cable for charging across the room. Thick braided jacket, 60W fast-charge support.',
 '5-metre USB-C braided cable for long-distance charging',
 14.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 4, false, true, ARRAY['accessories'],
 '{"length":"5m","wattage":"60W","material":"Nylon braid"}'::jsonb),

('1-to-3 Charging Cable 100W 1.2m',
 '1-to-3-charging-cable-100w',
 'One cable, three connectors — Type-C, Micro-USB, and Lightning in one 100W fast-charging cable. Charge any device without swapping cables.',
 'Triple-connector 100W fast-charging cable',
 6.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 10, false, true, ARRAY['bestseller','accessories'],
 '{"length":"1.2m","connectors":"USB-C, Micro-USB, Lightning","wattage":"100W"}'::jsonb),

('USB-C to Lightning LED Cable',
 'usbc-lightning-led-cable',
 'Premium USB-C to Lightning cable with glowing LED indicator. Shows charging status at a glance. MFi-compatible fast charging.',
 'USB-C to Lightning with LED charging indicator',
 8.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 2, false, true, ARRAY['accessories'],
 '{"connectors":"USB-C to Lightning","feature":"LED indicator","compatibility":"MFi"}'::jsonb),

('USB-C to Lightning Digital Cable',
 'usbc-lightning-digital-cable',
 'High-quality USB-C to Lightning digital cable for iPhone fast charging and CarPlay connectivity. Durable PVC jacket.',
 'USB-C to Lightning for iPhone fast charging',
 6.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 2, false, true, ARRAY['accessories'],
 '{"connectors":"USB-C to Lightning","compatibility":"iPhone, CarPlay"}'::jsonb),

-- CAR CHARGERS
('Super Fast Car Charger 66W',
 'super-fast-car-charger-66w',
 'Compact 66W dual-port car charger with USB-C PD and USB-A QC 3.0. Charges a phone from 0 to 50% in under 30 minutes.',
 'Dual-port 66W fast car charger',
 12.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 5, false, true, ARRAY['bestseller','accessories'],
 '{"wattage":"66W","ports":"1× USB-C PD, 1× USB-A QC3.0","compatibility":"Universal"}'::jsonb),

('Car Charger with Display 66W',
 'car-charger-display-66w',
 '66W car charger with live wattage/voltage LCD display. Know exactly what power your devices are receiving. Dual USB-C and USB-A output.',
 '66W car charger with live power display',
 15.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 5, false, true, ARRAY['bestseller','accessories'],
 '{"wattage":"66W","display":"LCD wattage/voltage","ports":"2× USB"}'::jsonb),

('Super Fast Car Charger 66W + PD20W',
 'car-charger-66w-pd20w',
 'Versatile car charger combining 66W USB-A and 20W USB-C PD output for charging phones, tablets and earbuds simultaneously.',
 '66W + PD20W dual-output fast car charger',
 12.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 15, false, true, ARRAY['bestseller','accessories'],
 '{"wattage":"66W + PD20W","ports":"1× USB-A 66W, 1× USB-C PD20W"}'::jsonb),

('Dual Super Fast Car Charger 66W',
 'dual-super-fast-car-charger',
 'Charge two devices at full speed simultaneously. Dual USB-A ports each delivering 66W output with QC 3.0 support.',
 'Dual 66W USB-A fast car charger',
 15.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 5, false, true, ARRAY['accessories'],
 '{"wattage":"66W × 2","ports":"2× USB-A QC3.0"}'::jsonb),

('Bluetooth Car Modulator FM QC3.0',
 'bt-car-modulator-qc3',
 'All-in-one Bluetooth FM transmitter, hands-free calling, USB car charger (QC3.0 + PD), and media controller. Stream your phone music through any car radio.',
 'BT FM transmitter + QC3.0 car charger in one',
 24.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 10, false, true, ARRAY['bestseller','accessories'],
 '{"bluetooth":"5.0","charging":"QC3.0 + PD","feature":"FM transmitter, hands-free"}'::jsonb),

-- GAN CHARGER HEADS
('50W GaN Charger 3-Port UK Plug',
 '50w-gan-charger-3port-uk',
 'Compact GaN technology wall charger with 3 ports (2× USB-C + 1× USB-A) delivering 50W total. UK plug. Foldable pins for travel.',
 'Compact 50W GaN 3-port UK wall charger',
 32.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 7, false, true, ARRAY['hightech','accessories'],
 '{"wattage":"50W","ports":"2× USB-C, 1× USB-A","plug":"UK","technology":"GaN"}'::jsonb),

('50W GaN Charger 2-Port UK Plug',
 '50w-gan-charger-2port-uk',
 'Slim GaN dual-port UK wall charger with USB-C PD and USB-A output. 50W total, ultra-compact footprint.',
 '50W GaN dual-port UK wall charger',
 29.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 4, false, true, ARRAY['hightech','accessories'],
 '{"wattage":"50W","ports":"1× USB-C PD, 1× USB-A","plug":"UK","technology":"GaN"}'::jsonb),

('50W GaN Charger 3-Port EU Plug',
 '50w-gan-charger-3port-eu',
 'European 3-port GaN charger for travel. 50W total output, compatible with all USB-C and USB-A devices.',
 '50W GaN 3-port EU travel charger',
 32.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 2, false, true, ARRAY['hightech','accessories'],
 '{"wattage":"50W","ports":"2× USB-C, 1× USB-A","plug":"EU","technology":"GaN"}'::jsonb),

-- INVERTERS
('DC-AC Power Inverter 300W with Display',
 'dc-ac-inverter-300w-display',
 '300W modified sine-wave DC to AC power inverter with LCD voltage/wattage display and dual USB charging ports. Ideal for cars, trucks and load-shedding backup.',
 '300W DC-AC inverter with LCD display and USB ports',
 84.00,
 (SELECT id FROM public.categories WHERE slug = 'electronics'),
 5, true, true, ARRAY['hightech'],
 '{"power":"300W","input":"12V DC","output":"240V AC","display":"LCD","usb_ports":2}'::jsonb),

('DC-AC Power Inverter 300W',
 'dc-ac-inverter-300w',
 '300W modified sine-wave DC to AC power inverter. Clean power output with protection against overload, over-temperature and short circuit.',
 '300W DC-AC inverter for car and backup power',
 68.00,
 (SELECT id FROM public.categories WHERE slug = 'electronics'),
 5, false, true, ARRAY['hightech'],
 '{"power":"300W","input":"12V DC","output":"240V AC","protection":"overload, thermal, short circuit"}'::jsonb),

-- EARBUDS
('R510 TWS Wireless Earbuds',
 'r510-tws-earbuds',
 'True wireless stereo earbuds with Bluetooth 5.3, active noise cancellation and up to 28 hours total playtime with charging case.',
 'TWS earbuds with ANC and 28-hour total playtime',
 19.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 2, false, true, ARRAY['bestseller'],
 '{"bluetooth":"5.3","anc":true,"playtime":"7h + 21h case","driver":"10mm dynamic"}'::jsonb),

('C01 Bluetooth Earbuds',
 'c01-bt-earbuds',
 'Lightweight Bluetooth 5.0 earbuds with clear audio, inline controls and 4-hour battery. Simple, reliable everyday earbuds.',
 'Lightweight BT 5.0 earbuds for everyday use',
 17.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 1, false, true, ARRAY['bestseller'],
 '{"bluetooth":"5.0","playtime":"4h + 12h case"}'::jsonb),

('WAVE BEAM2 Wireless Earbuds',
 'wave-beam2-earbuds',
 'Premium WAVE BEAM2 earbuds with dual-driver audio, IPX5 water resistance, fast-pair and 30-hour total battery with the case.',
 'Dual-driver IPX5 earbuds with 30-hour total battery',
 29.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 9, false, true, ARRAY['bestseller'],
 '{"bluetooth":"5.3","waterproof":"IPX5","playtime":"8h + 22h case","driver":"dual"}'::jsonb),

('Buds3 Pro Wireless Earbuds',
 'buds3-pro-earbuds',
 'Studio-quality wireless earbuds with active noise cancellation, spatial audio, and Qi wireless charging case. Premium listening for audiophiles.',
 'ANC spatial audio earbuds with wireless charging case',
 38.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 4, false, true, ARRAY['premium','hightech'],
 '{"anc":true,"spatial_audio":true,"wireless_charging":true,"playtime":"6h + 24h case"}'::jsonb),

('Buds2 Pro R510 Earbuds',
 'buds2-pro-r510-earbuds',
 'Buds2 Pro earbuds with enhanced bass, ANC, and an ergonomic in-ear design for secure fit during workouts.',
 'ANC earbuds with enhanced bass and secure fit',
 31.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 3, false, true, ARRAY['bestseller'],
 '{"anc":true,"playtime":"6h + 20h case","design":"ergonomic in-ear"}'::jsonb),

-- HEADPHONES
('WH-1000XM4 Style ANC Headphones',
 'wh-1000xm4-style-anc',
 'Over-ear wireless headphones with industry-leading active noise cancellation, 30-hour battery life, multipoint connection and premium 40mm drivers for rich, detailed sound.',
 'Premium ANC over-ear headphones — 30-hour battery',
 72.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 5, false, true, ARRAY['premium'],
 '{"anc":true,"playtime":"30h","driver":"40mm","connection":"multipoint BT 5.0","foldable":true}'::jsonb),

('Picun B8 Bluetooth Headphones',
 'picun-b8-bt-headphones',
 'Comfortable over-ear Bluetooth headphones with deep bass, foldable design and 40-hour playtime. SD card slot and FM radio included.',
 'Foldable BT headphones — 40-hour battery, FM radio',
 46.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 2, false, true, ARRAY['premium'],
 '{"playtime":"40h","fm_radio":true,"sd_card":true,"driver":"40mm","foldable":true}'::jsonb),

('PX11 ANC Wireless Headphones',
 'px11-anc-headphones',
 'Compact ANC wireless headphones with hybrid noise cancellation, transparent mode and 28-hour battery. Ideal for commuting and travel.',
 'ANC headphones with transparent mode — 28-hour battery',
 57.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 2, false, true, ARRAY['hightech'],
 '{"anc":"hybrid","transparent_mode":true,"playtime":"28h","foldable":true}'::jsonb),

('Picun UTV-01 TV Wireless Headphones',
 'picun-utv01-tv-headphones',
 'Wireless headphones designed for TV watching. No Bluetooth required — uses a 2.4GHz USB transmitter. 100m range, 20-hour battery.',
 'Wireless TV headphones with 2.4GHz USB transmitter',
 38.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 5, false, true, ARRAY['accessories'],
 '{"wireless":"2.4GHz USB dongle","range":"100m","playtime":"20h","plug":"no BT required"}'::jsonb),

('QC55 ANC Wireless Headphones',
 'qc55-anc-headphones',
 'Value-for-money active noise cancelling headphones with 45-hour battery, fast charge (15min = 3h), and comfortable memory foam ear cups.',
 'ANC headphones — 45-hour battery, fast charge',
 44.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 8, false, true, ARRAY['bestseller'],
 '{"anc":true,"playtime":"45h","fast_charge":"15min = 3h","ear_cups":"memory foam"}'::jsonb),

('H80 ANC + ENC Premium Headphones',
 'h80-anc-enc-headphones',
 'Professional-grade headphones featuring both Active Noise Cancellation (ANC) and Environmental Noise Cancellation (ENC) for crystal-clear calls and immersive music. 50-hour battery.',
 'Dual ANC+ENC headphones — 50-hour battery',
 95.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 1, true, true, ARRAY['premium','hightech'],
 '{"anc":true,"enc":true,"playtime":"50h","driver":"40mm premium","call_quality":"ENC"}'::jsonb),

-- SPEAKERS
('JBL Charge 6 Compatible Bluetooth Speaker',
 'jbl-charge6-bt-speaker',
 'Waterproof portable Bluetooth speaker with 360° sound, 24-hour battery, built-in power bank and JBL Partyboost for stereo pairing.',
 'Waterproof BT speaker — 24h battery and power bank',
 107.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 1, true, true, ARRAY['premium'],
 '{"waterproof":"IPX7","playtime":"24h","power_bank":true,"partyboost":true,"driver":"360°"}'::jsonb),

('JBL Carry Portable Bluetooth Speaker',
 'jbl-carry-bt-speaker',
 'Compact yet powerful portable speaker with punchy bass, 12-hour battery and a durable carry strap. Perfect for on-the-go listening.',
 'Portable BT speaker with carry strap — 12-hour battery',
 76.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 1, false, true, ARRAY['premium'],
 '{"playtime":"12h","carry_strap":true,"waterproof":"IPX5"}'::jsonb),

('BT618B Waterproof Mini Speaker',
 'bt618b-mini-speaker',
 'Pocket-sized waterproof Bluetooth speaker — big sound from a tiny package. 6-hour battery, suction cup mount included.',
 'Pocket waterproof BT speaker with suction mount',
 17.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 2, false, true, ARRAY['bestseller'],
 '{"waterproof":"IPX6","playtime":"6h","size":"mini","suction_cup":true}'::jsonb),

('BT201 Bluetooth Mini Speaker',
 'bt201-mini-speaker',
 'Affordable mini Bluetooth speaker with clear stereo sound, RGB mood lighting and 4-hour battery. Great desk or bedside companion.',
 'Mini BT speaker with RGB lighting',
 13.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 2, false, true, ARRAY['bestseller'],
 '{"playtime":"4h","rgb":true,"bluetooth":"5.0"}'::jsonb),

('JC-2309 Outdoor Bluetooth Speaker',
 'jc2309-outdoor-bt-speaker',
 'Rugged outdoor Bluetooth speaker with dual-driver stereo sound, IPX6 waterproofing, 12-hour playtime and built-in microphone.',
 'Rugged outdoor BT speaker — 12h, IPX6',
 30.00,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 1, false, true, ARRAY['bestseller'],
 '{"waterproof":"IPX6","playtime":"12h","drivers":2,"microphone":true}'::jsonb),

('ST-153 Mini Colourful Desk Speaker (Pair)',
 'st153-mini-desk-speaker-pair',
 'Cute wired desktop speaker pair with RGB colourful lighting. Plug-and-play USB power, 3.5mm aux input, no driver required.',
 'RGB wired desktop speaker pair — plug-and-play',
 9.50,
 (SELECT id FROM public.categories WHERE slug = 'audio'),
 2, false, true, ARRAY['accessories','bestseller'],
 '{"type":"wired pair","power":"USB","input":"3.5mm aux","rgb":true}'::jsonb),

-- LAPTOP COOLING PADS
('Gaming Laptop Cooling Pad 5-Level RGB',
 'gaming-cooling-pad-5level-rgb',
 'High-performance gaming laptop cooling pad with 5 adjustable fan speeds, 5 height settings, RGB lighting and dual USB pass-through ports. Fits laptops up to 17 inches.',
 'RGB gaming cooling pad — 5-speed, 5-height, 17 inch',
 46.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 4, false, true, ARRAY['bestseller','accessories'],
 '{"fan_speeds":5,"height_settings":5,"rgb":true,"usb_ports":2,"max_size":"17 inch"}'::jsonb),

('LS001 Gaming Cooling Pad Dual USB',
 'ls001-gaming-cooling-pad',
 'Dual-fan laptop cooling pad with 2 USB pass-through ports, adjustable speed and blue LED lighting. Quiet fans for a distraction-free setup.',
 'Dual-fan cooling pad with 2 USB ports',
 34.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 3, false, true, ARRAY['bestseller','accessories'],
 '{"fans":2,"usb_ports":2,"led":"blue","max_size":"15.6 inch"}'::jsonb),

('Foldable Laptop Cooling Pad',
 'foldable-laptop-cooling-pad',
 'Space-saving foldable cooling stand with built-in fan. Collapses flat for portability. Adjustable angle and single USB connection.',
 'Foldable cooling stand with built-in fan',
 27.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 3, false, true, ARRAY['accessories'],
 '{"foldable":true,"fans":1,"usb":"single connection"}'::jsonb),

('Dual Fan Laptop Cooling Pad',
 'dual-fan-laptop-cooling-pad',
 'Slim dual-fan cooling pad with adjustable height settings, non-slip surface and whisper-quiet operation. Universal compatibility up to 17 inches.',
 'Quiet dual-fan laptop cooling pad',
 30.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 5, false, true, ARRAY['bestseller','accessories'],
 '{"fans":2,"max_size":"17 inch","noise":"whisper-quiet"}'::jsonb),

-- THERMAL / BLUETOOTH PRINTER
('MPT-II Bluetooth Thermal Printer 58mm',
 'mpt-ii-bt-thermal-printer',
 'Portable 58mm Bluetooth thermal printer for receipts, labels and notes. Inkless printing, USB and Bluetooth connectivity, compatible with iOS and Android.',
 'Portable 58mm BT thermal printer — no ink required',
 55.00,
 (SELECT id FROM public.categories WHERE slug = 'electronics'),
 15, false, true, ARRAY['bestseller','hightech'],
 '{"width":"58mm","connectivity":"Bluetooth + USB","inkless":true,"compatibility":"iOS + Android"}'::jsonb),

-- GPS TRACKERS
('SinoTrack ST-901A GPS Tracker',
 'sinotrack-st-901a-gps',
 'Real-time GPS vehicle tracker with GSM/GPRS, waterproof magnetic housing and engine cut-off feature. Free lifetime tracking platform. Compatible with iOS and Android apps.',
 'Real-time GPS tracker — free platform, engine cut-off',
 38.00,
 (SELECT id FROM public.categories WHERE slug = 'electronics'),
 30, true, true, ARRAY['bestseller','hightech'],
 '{"sim":"GSM","waterproof":true,"engine_cutoff":true,"platform":"free lifetime","app":"iOS + Android"}'::jsonb),

('GF-09 Mini GPS Car Tracker',
 'gf09-mini-gps-tracker',
 'Ultra-compact hidden GPS tracker with strong magnet, real-time tracking, geofence alerts and SOS button. Ideal for vehicles, bags and valuables.',
 'Compact hidden GPS tracker with magnet mount',
 29.00,
 (SELECT id FROM public.categories WHERE slug = 'electronics'),
 10, false, true, ARRAY['bestseller','hightech'],
 '{"size":"ultra-compact","magnet":true,"sos":true,"geofence":true}'::jsonb),

-- SMART LOCK
('Tuya WiFi Smart Lock',
 'tuya-wifi-smart-lock',
 'Keyless smart door lock with fingerprint, PIN code, RFID card, phone app and mechanical key access. WiFi-connected via Tuya SmartLife app. Auto-lock, activity history and tamper alerts.',
 'Keyless smart lock — fingerprint, PIN, RFID, WiFi app',
 213.00,
 (SELECT id FROM public.categories WHERE slug = 'smart-home'),
 2, true, true, ARRAY['premium','hightech'],
 '{"methods":"fingerprint, PIN, RFID, app, key","wifi":true,"app":"Tuya SmartLife","auto_lock":true,"tamper_alert":true}'::jsonb),

-- SMARTWATCHES
('S10 Business Smartwatch',
 's10-business-smartwatch',
 'Elegant business smartwatch with AMOLED display, health monitoring (heart rate, SpO2, sleep), 100+ sport modes, IP68 waterproofing and 7-day battery life.',
 'AMOLED business smartwatch — 7-day battery, IP68',
 61.00,
 (SELECT id FROM public.categories WHERE slug = 'wearables'),
 2, false, true, ARRAY['hightech'],
 '{"display":"AMOLED","battery":"7 days","waterproof":"IP68","sensors":"HR, SpO2, sleep","sport_modes":100}'::jsonb),

('S9 Ultra Smartwatch 49mm',
 's9-ultra-smartwatch-49mm',
 'Large 49mm smartwatch with ultra-high-definition AMOLED display, titanium-alloy frame, dual-band GPS, advanced health sensors and 8-day battery. Includes spare silicone band.',
 '49mm Ultra smartwatch — titanium, dual-band GPS',
 68.00,
 (SELECT id FROM public.categories WHERE slug = 'wearables'),
 1, false, true, ARRAY['premium','hightech'],
 '{"display":"AMOLED 49mm","frame":"titanium alloy","gps":"dual-band","battery":"8 days","sensors":"HR, SpO2, ECG"}'::jsonb),

-- OTG ADAPTER
('OTG USB-C to USB 3.0 Adapter',
 'otg-usbc-to-usb3-adapter',
 'Compact USB-C OTG adapter for connecting USB 3.0 devices (flash drives, keyboards, mice, hard drives) to USB-C phones and tablets.',
 'USB-C OTG adapter for USB 3.0 devices',
 6.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 4, false, true, ARRAY['accessories'],
 '{"input":"USB-C","output":"USB 3.0","speed":"5Gbps"}'::jsonb),

-- DRONE
('E88Pro 4K RC Drone with Camera',
 'e88pro-4k-rc-drone',
 'High-performance foldable quadcopter with 4K dual cameras (front + downward), GPS auto-return, altitude hold, 25-minute flight time and 500m control range. Includes carry bag.',
 '4K dual-camera GPS drone — 25min flight, 500m range',
 247.00,
 (SELECT id FROM public.categories WHERE slug = 'electronics'),
 1, true, true, ARRAY['premium','hightech'],
 '{"camera":"4K dual (front + bottom)","gps":"auto-return","flight_time":"25min","range":"500m","foldable":true,"carry_bag":true}'::jsonb),

-- TOOLS
('115-in-1 Precision Screwdriver Set',
 '115-in-1-precision-screwdriver',
 'Professional precision screwdriver set with 115 magnetic bits covering Torx, Phillips, Pentalobe, Tri-wing and more. Ideal for electronics repair, laptops, smartphones and gaming consoles.',
 '115-bit precision screwdriver set for electronics repair',
 107.00,
 (SELECT id FROM public.categories WHERE slug = 'tools'),
 1, false, true, ARRAY['premium'],
 '{"bits":115,"types":"Torx, Phillips, Pentalobe, Tri-wing, Hex, Slotted","magnetic":true}'::jsonb),

('42-in-1 Magnetic Phone Repair Kit',
 '42-in-1-phone-repair-kit',
 'Complete phone repair toolkit with 42 precision bits, spudger, pry tools, tweezers and opening picks. Fits in a compact pouch for on-the-go repairs.',
 '42-piece phone repair kit with all essential tools',
 46.00,
 (SELECT id FROM public.categories WHERE slug = 'tools'),
 1, false, true, ARRAY['tools'],
 '{"pieces":42,"includes":"bits, spudger, pry tools, tweezers, picks","carry_pouch":true}'::jsonb),

('POLY Mobile Phone Repair Station',
 'poly-phone-repair-station',
 'Professional mobile phone repair workstation with rotating clamp, adjustable PCB holder, screen separator arm and anti-static surface. Essential for repair shop setups.',
 'Professional phone repair workstation for repair shops',
 144.00,
 (SELECT id FROM public.categories WHERE slug = 'tools'),
 2, false, true, ARRAY['premium','hightech'],
 '{"features":"rotating clamp, PCB holder, screen separator, anti-static","use":"professional repair"}'::jsonb),

-- WIRELESS CAR CHARGER
('Vikefon Magnetic Wireless Car Charger',
 'vikefon-magnetic-car-charger',
 'MagSafe-compatible magnetic wireless car charger that attaches to your AC/heating vent. 15W Qi fast wireless charging, 360° rotation, compatible with iPhone 12+ and all Qi devices.',
 'MagSafe magnetic vent car charger — 15W Qi',
 21.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 1, false, true, ARRAY['hightech','accessories'],
 '{"wattage":"15W Qi","magsafe":true,"mount":"vent","rotation":"360°","compatibility":"iPhone 12+, all Qi"}'::jsonb),

-- LASER PRINTER
('Handheld Laser Printer Touchless',
 'handheld-laser-printer',
 'Revolutionary touchless handheld laser printer — print on any surface without contact: cardboard, fabric, wood, metal, glass. Bluetooth-connected, use your phone as the design tool.',
 'Touchless handheld laser printer for any surface',
 198.00,
 (SELECT id FROM public.categories WHERE slug = 'electronics'),
 2, true, true, ARRAY['premium','hightech'],
 '{"type":"handheld laser","surfaces":"cardboard, fabric, wood, metal, glass","connectivity":"Bluetooth","inkless":true}'::jsonb),

-- PHOTO PAPER
('300g Glossy Photo Printing Paper (Set of 2)',
 '300g-photo-paper-set',
 'Professional-grade 300gsm high-gloss photo printing paper. Set of 2 packs. Compatible with inkjet printers. Delivers vibrant, true-to-life colours with sharp detail.',
 '300gsm glossy photo paper — set of 2',
 23.00,
 (SELECT id FROM public.categories WHERE slug = 'accessories'),
 2, false, true, ARRAY['accessories'],
 '{"weight":"300gsm","finish":"high gloss","packs":2,"printer":"inkjet compatible"}'::jsonb)

ON CONFLICT (slug) DO NOTHING;


-- ── 3. Product images (Unsplash — already in next.config.ts allowed domains) ──

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = '12-android-tab-pro14' ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = '10-android-tab' ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  '100w-usb-c-cable-1m','type-c-braided-2m','type-c-braided-1-5m',
  'type-c-braided-5m','1-to-3-charging-cable-100w',
  'usbc-lightning-led-cable','usbc-lightning-digital-cable'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'super-fast-car-charger-66w','car-charger-display-66w',
  'car-charger-66w-pd20w','dual-super-fast-car-charger',
  '50w-gan-charger-3port-uk','50w-gan-charger-2port-uk','50w-gan-charger-3port-eu'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = 'bt-car-modulator-qc3' ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN ('dc-ac-inverter-300w-display','dc-ac-inverter-300w') ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'r510-tws-earbuds','c01-bt-earbuds','wave-beam2-earbuds',
  'buds3-pro-earbuds','buds2-pro-r510-earbuds'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'wh-1000xm4-style-anc','picun-b8-bt-headphones',
  'px11-anc-headphones','qc55-anc-headphones','h80-anc-enc-headphones',
  'picun-utv01-tv-headphones'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'jbl-charge6-bt-speaker','jbl-carry-bt-speaker',
  'jc2309-outdoor-bt-speaker'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'bt618b-mini-speaker','bt201-mini-speaker','st153-mini-desk-speaker-pair'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'gaming-cooling-pad-5level-rgb','ls001-gaming-cooling-pad',
  'foldable-laptop-cooling-pad','dual-fan-laptop-cooling-pad'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = 'mpt-ii-bt-thermal-printer' ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'sinotrack-st-901a-gps','gf09-mini-gps-tracker'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = 'tuya-wifi-smart-lock' ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN ('s10-business-smartwatch','s9-ultra-smartwatch-49mm') ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  'otg-usbc-to-usb3-adapter','vikefon-magnetic-car-charger'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = 'e88pro-4k-rc-drone' ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug IN (
  '115-in-1-precision-screwdriver','42-in-1-phone-repair-kit','poly-phone-repair-station'
) ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = 'handheld-laser-printer' ON CONFLICT DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format', p.name, true, 0
FROM public.products p WHERE p.slug = '300g-photo-paper-set' ON CONFLICT DO NOTHING;

-- Done. Run this once in the Supabase SQL editor.
-- To re-run safely: the ON CONFLICT DO NOTHING clauses prevent duplicates.
