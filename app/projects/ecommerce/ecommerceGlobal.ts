import { atom } from 'jotai'

export type product = {
    id: string,
    name: string;
    desc: string;
    imgSrc: string;
    rating: number;
    price: number;
    slug: string,
    forCategory: productCategory,
    bestSeller?: boolean,
}

export const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export type productCategory = "desktops" | "tablets" | "phones" | "cameras" | "headphones"

export const productCartGlobal = atom<{ product: product, quantity: number }[] | undefined>(undefined)

export const products: { [key in productCategory]: product[] } = {
    desktops: [
        {
            id: "sakslcksm-36e2-472a-b1ba-7ec1bb6a2337",
            name: "HIGH END GAMING PC | Intel Core i7-14700KF 20x3.40GHz | 32GB DDR5 | RTX 4080 16GB DLSS 3 | 1TB M.2 SSD",
            desc: ` Intel Core i7-14700KF, 20x 3.40GHz
            32GB DDR5 RAM 5600 MHz ADATA
            NVIDIA GeForce RTX 4080 - 16GB
            MSI Pro Z790-P WIFI
            1000 GB M.2 SSD Western Digital WD Black SN850X`,
            imgSrc: require(`@/public/projects/ecommerce/desktopbestseller.webp`).default.src,
            rating: 4.89,
            price: 2599.00,
            bestSeller: true,
            slug: "HIGH_END_GAMING_PC_|_Core_i7-14700KF_20x3.40GHz_|_32GB_DDR5_|_RTX_4080_16GB_DLSS_3_|_1TB_M.2_SSD",
            forCategory: "desktops"
        },
        {
            id: "70d27fd9-36e2-472a-b1ba-slskckmksal",
            name: "Lenovo ThinkBook 15 Premium Business Laptop",
            desc: `Processor: AMD Ryzen 5 5500U 2.10GHz 6-Core Processor (11MB Cache, up to 4.00GHz)
    
            Graphics: AMD Radeon Graphics
            
            Operating system: Windows 11 Pro 64-bit
            
            Memory: 12GB DDR4 SDRAM 
            
            Hard Drive: 512GB PCIe NVMe M.2 Solid State Drive
            
            Optical Drive: No
            
            Display: 15.6" FHD (1920x1080) TN 220nits Anti-glare, 45% NTSC
            
            Connectivity: Wi-Fi 6, (802.11ax) + Bluetooth 5.1
            
            Audio: High Definition (HD) Audio, Stereo speakers, 2W x2, Dolby Audio
            
            Keyboard: US English, Backlit Full Size Keyboard
            
            Built-in HD Webcam: HD 720p with Privacy Shutter
            
            Media Drive: Multi-format SD media card reader
            
            Ports: 
            
            2 x USB 3.2 Gen 1
            2 x USB-C 3.2 Gen 2 (support data transfer, Power Delivery 3.0 and DisplayPort 1.4)
            1 x HDMI 1.4b
            1 x Ethernet (RJ-45)
            1 x Headphone / Mic Combo Jack
            Battery: Up to 7.5 Hours
            
            Color: Mineral Grey
            
            Dimensions L x W x H (inches): 14.1 x 9.25 x 0.74
            
            Weight: 3.75 lbs`,
            imgSrc: "https://m.media-amazon.com/images/I/81xOIY45QwL._AC_UY327_FMwebp_QL65_.jpg",
            rating: 4.7,
            price: 547.36,
            slug: "lenovo_thinkbook_15_premium_business_laptop",
            forCategory: "desktops"
        },
        {
            id: "ed4486d3-5d50-44b9-a55c-c251ddd4dbe6",
            name: "HP Elite Desktop PC Computer Intel Core i5 3.1-GHz, 8 gb Ram",
            desc: `This custom bundle includes 5 items...
    
            - RENEWED HP Professional Desktop PC with Intel Quad Core i5 3.1 GHz processor, 8 GB RAM, 1 TB Hard Drive, DVD, Windows 10 Home (with all necessary cables)
          
            - WiFi Adapter - USB WiFi (300Mbps, compatible with Windows 10, WPA2 encryption)
          
            - RENEWED 19" LCD Monitor (Brand May Vary)
          
            - USB Keyboard (Brand May Vary)
          
            - USB Mouse (Brand May Vary)
          
          Every component is tested for full functionality and compatibility to ensure years of ongoing performance and reliability. Exterior cosmetics are restored to a like-new condition with little to no visible signs of previous use. A fresh and authentic installation of Microsoft Windows 10 is performed with the new activation license digitally rendered in the PC for an easy and secure start upon first use.
          
           
          
          PC Custom Configuration Specs
          
             -Model: HP Professional Desktop
          
             - CPU: Intel Quad Core i5 Processor
          
             - RAM: 8 GB DDR3
          
             - Hard Drive: 1 TB SATA
          
             - Operating System: Windows 10 Home
          
             - Optical: DVD
          
             - USB: (10) USB 2.0 ports for connectivity
          
             - Network: Onboard Gigabit Network Adapter
          
          * This computer bundle will arrive at your doorstep ready to use right out of the box with all necessary cables included.`,
            imgSrc: "https://m.media-amazon.com/images/I/718sn7oOcfL._AC_SL1500_.jpg",
            rating: 3.9,
            price: 826.21,
            slug: "hp_elite_desktop_pc_computer_intel_core_i5_3.1-ghz,_8_gb_ram",
            forCategory: "desktops"
        },
        {
            id: "9e904485-eb5c-48c0-8a78-a60ac5e6e32f",
            name: "TechMaster Desktop",
            desc: "Powerful desktop computer with Intel Core i9 processor, 32GB RAM, 1TB SSD, and NVIDIA GeForce RTX 3080 graphics card.",
            imgSrc: "https://m.media-amazon.com/images/I/71B5z0eg2NL._AC_SL1500_.jpg",
            rating: 4.8,
            price: 2499.99,
            slug: "techmaster_desktop",
            forCategory: "desktops"
        },
        {
            id: "1947bbb7-ca77-4d3e-b647-fb5967d726d1",
            name: "Gaming Beast Desktop",
            desc: "High-performance gaming desktop with AMD Ryzen 9 processor, 64GB RAM, 2TB SSD, and NVIDIA GeForce RTX 3090 graphics card.",
            imgSrc: "https://m.media-amazon.com/images/I/91Fb+Pcxe-L._AC_SL1500_.jpg",
            rating: 4.9,
            price: 3999.99,
            slug: "gaming_beast_desktop",
            forCategory: "desktops"
        },
        {
            id: "8741c16e-b273-4f7f-a396-0e71a9497029",
            name: "OfficePro Desktop",
            desc: "Efficient desktop computer for office use with Intel Core i5 processor, 16GB RAM, 512GB SSD, and integrated Intel UHD Graphics 630.",
            imgSrc: "https://m.media-amazon.com/images/I/61QGMX0Qy6L._AC_SL1352_.jpg",
            rating: 4.5,
            price: 899.99,
            slug: "officepro_desktop",
            forCategory: "desktops"
        },
        {
            id: "198bc026-7606-440b-a285-ecdb7fffa5fa",
            name: "Dell XPS 8930 Desktop Computer",
            desc: "Powerful desktop computer with Intel Core i7 processor, 16GB DDR4 RAM, 512GB SSD + 2TB HDD storage, NVIDIA GeForce GTX 1660 Ti graphics, and Windows 10 operating system.",
            imgSrc: "https://m.media-amazon.com/images/I/61PLUeR9MoS._AC_SL1500_.jpg",
            rating: 4.5,
            price: 1199.99,
            slug: "dell_xps_8930_desktop_computer",
            forCategory: "desktops"

        },
        {
            id: "38d79428-c87f-4fde-bb22-b4f6e9981671",
            name: "HP ENVY Desktop Computer",
            desc: "Elegant desktop computer with Intel Core i5 processor, 8GB DDR4 RAM, 256GB SSD + 1TB HDD storage, NVIDIA GeForce GTX 1650 graphics, and Windows 10 operating system.",
            imgSrc: "https://m.media-amazon.com/images/I/7183K6XIaeL._AC_SL1500_.jpg",
            rating: 4.3,
            price: 899.99,
            slug: "hp_envy_desktop_computer",
            forCategory: "desktops"

        },
        {
            id: "2631e4b3-8238-494c-8816-337932ade4af",
            name: "Apple iMac 27-inch Retina 5K Display",
            desc: "Sleek all-in-one desktop computer with Intel Core i5 processor, 8GB DDR4 RAM, 512GB SSD storage, AMD Radeon Pro 5500 XT graphics, and macOS operating system.",
            imgSrc: "https://m.media-amazon.com/images/I/717q8QReNaL._AC_SX679_.jpg",
            rating: 4.8,
            price: 1799.00,
            slug: "apple_imac_27-inch_retina_5k_display",
            forCategory: "desktops"

        },
        {
            id: "61674c6e-bbf5-4e4c-b233-5a4a9a5dabae",
            name: "Lenovo IdeaCentre AIO 3 Desktop",
            desc: "Space-saving all-in-one desktop computer with AMD Ryzen 5 processor, 8GB DDR4 RAM, 256GB SSD storage, AMD Radeon Graphics, and Windows 10 operating system.",
            imgSrc: "https://m.media-amazon.com/images/I/71Ezvxd+uiL._AC_SL1500_.jpg",
            rating: 4.4,
            price: 649.99,
            slug: "lenovo_ideacentre_aio_3_desktop",
            forCategory: "desktops"

        },
        {
            id: "85a32063-2ac9-4c3a-b908-bb77ba49546c",
            name: "Acer Aspire TC-895-UA92 Desktop",
            desc: "Affordable desktop computer with Intel Core i5 processor, 12GB DDR4 RAM, 512GB SSD storage, Intel UHD Graphics 630, and Windows 10 operating system.",
            imgSrc: "https://m.media-amazon.com/images/I/718V28DwSjL._AC_SL1500_.jpg",
            rating: 4.2,
            price: 599.99,
            slug: "acer_aspire_tc-895-ua92_desktop",
            forCategory: "desktops"
        }

    ],
    tablets: [
        {
            id: "dskaskckl-cd64-4c32-ac6a-ca361fa82f42",
            name: "HiPad Max",
            desc: "Providing a 10.36 inch 2K resolution display, the HiPad Max lets you enjoy realistic graphics to enhance your film and gaming experience. The high resolution display boasts an 84% screen-to-display ratio.",
            imgSrc: "https://www.chuwi.com/public/upload/image/20221229/d7fb617f299fe7a44b47425df86d83c2.png",
            rating: 4.7,
            price: 999.99,
            bestSeller: true,
            slug: "HiPad_Max",
            forCategory: "tablets"
        },
    ],
    phones: [
        {
            id: "54e9c0a2-b727-47a3-aaad-askcnslkamsl",
            name: "Galaxy S23 Ultra",
            desc: "Get the ultimate Galaxy experience with the S23 Ultra. The latest generation of mobile processing power: Qualcomm Snapdragon 8 Gen 2 for Galaxy. Capture perfect pics after sundown with the Quad rear 200MP camera. Relive every night in perfect clarity.",
            imgSrc: "https://lmt-web.mstatic.lv/eshop/9770/Samsung-S23-Ultra-EE_black_back.png",
            rating: 4.7,
            price: 999.99,
            bestSeller: true,
            slug: "Galaxy_S23_Ultra",
            forCategory: "phones"
        },

        {
            id: "751c8a50-2381-4757-81fd-c17baa16cbde",
            name: "PowerMax Pro Smartphone",
            desc: "High-capacity battery smartphone with 7-inch display, MediaTek Dimensity 1200 processor, 8GB RAM, 128GB storage, and 64MP triple-camera setup.",
            imgSrc: "https://m.media-amazon.com/images/I/61BgDOd6ViL._AC_SL1000_.jpg",
            rating: 4.6,
            price: 699.99,
            slug: "powermax_pro_smartphone",
            forCategory: "phones"

        },
        {
            id: "xasclmscal-6555-44eb-b973-67cc1b0d369c",
            name: "CameraPro Smartphone",
            desc: "Smartphone with advanced camera features, including a 108MP main camera, 8K video recording, Snapdragon 865 processor, 12GB RAM, and 512GB storage.",
            imgSrc: "https://m.media-amazon.com/images/I/61ePWSuIfwL._AC_SL1500_.jpg",
            rating: 4.8,
            price: 1199.99,
            slug: "camerapro_smartphone",
            forCategory: "phones"
        },
        {
            id: "78e0d268-8ee6-4832-864f-b6d83c7e5eaa",
            name: "Samsung Galaxy S21 Ultra",
            desc: "Flagship smartphone with 6.8-inch QHD+ Dynamic AMOLED display, Exynos 2100 processor, 12GB RAM, 256GB storage, and quad-camera setup with 108MP main camera.",
            imgSrc: "https://m.media-amazon.com/images/I/61muVHB96cS._AC_SL1500_.jpg",
            rating: 4.8,
            price: 1299.99,
            slug: "samsung_galaxy_s21_ultra",
            forCategory: "phones"
        },
        {
            id: "3b179541-d00c-425e-a597-566367c7f348",
            name: "iPhone 13 Pro Max",
            desc: "Top-of-the-line iPhone with 6.7-inch Super Retina XDR display, A15 Bionic chip, 128GB storage, and triple-camera system with ProRAW support.",
            imgSrc: "https://m.media-amazon.com/images/I/71hIjJkMqFL._AC_SL1500_.jpg",
            rating: 4.9,
            price: 1399.99,
            slug: "iphone_13_pro_max",
            forCategory: "phones"
        },
        {
            id: "cdfbb6b3-7aee-430d-9b57-6d8f00880ecc",
            name: "Google Pixel 6 Pro",
            desc: "Google's flagship smartphone with 6.7-inch LTPO OLED display, Google Tensor chip, 12GB RAM, 256GB storage, and dual-camera system with new computational photography features.",
            imgSrc: "https://m.media-amazon.com/images/I/71iQQmucjgL._AC_SL1500_.jpg",
            rating: 4.7,
            price: 999.99,
            slug: "google_pixel_6_pro",
            forCategory: "phones"
        },
        {
            id: "1c9259c9-8614-4814-bed0-a785d511cb90",
            name: "OnePlus 9 Pro",
            desc: "High-performance smartphone with 6.7-inch Fluid AMOLED display, Snapdragon 888 processor, 8GB RAM, 128GB storage, and Hasselblad quad-camera system.",
            imgSrc: "https://m.media-amazon.com/images/I/81v-fUYu6zS._AC_SL1500_.jpg",
            rating: 4.6,
            price: 999.99,
            slug: "oneplus_9_pro",
            forCategory: "phones"
        },
        {
            id: "83b2a2e9-2b1e-4850-b2c9-d100047f6d86",
            name: "Xiaomi Mi 11 Ultra",
            desc: "Premium smartphone with 6.81-inch AMOLED display, Snapdragon 888 processor, 12GB RAM, 256GB storage, and triple-camera system with 50MP main camera and 120x zoom.",
            imgSrc: "https://m.media-amazon.com/images/I/41wKBxAos4L._AC_.jpg",
            rating: 4.8,
            price: 1199.99,
            slug: "xiaomi_mi_11_ultra",
            forCategory: "phones"
        }

    ],
    cameras: [
        {
            id: "3665bb4f-6ffb-4f14-98fa-5ca2abf8d940",
            name: "Nikon Z 6II Mirrorless Camera",
            desc: "A peak moment frozen in a dramatic still image. A beautiful, flowing sequence captured in cinematic 4K UHD video. The new Nikon Z 6II, an upgrade of the Z 6 all-rounder, gives you both. Harnessing Dual EXPEED 6 image-processing engines.",
            imgSrc: require(`@/public/projects/ecommerce/camerabestseller.webp`).default.src,
            rating: 4.9,
            price: 2999.99,
            bestSeller: true,
            slug: "Nikon_Z_6II_Mirrorless_Camera",
            forCategory: "cameras"
        },
        {
            id: "sakskdlsks-6ffb-4f14-98fa-5ca2abf8d940",
            name: "Nikon D850 DSLR Camera",
            desc: "Professional-grade DSLR camera with 45.7MP full-frame sensor, EXPEED 5 image processor, 4K UHD video, and built-in Wi-Fi and Bluetooth.",
            imgSrc: "https://m.media-amazon.com/images/I/617sGSjmC1L._AC_SL1500_.jpg",
            rating: 4.9,
            price: 2999.99,
            slug: "nikon_d850_dslr_camera",
            forCategory: "cameras"
        },
        {
            id: "1aef6fe3-bf98-48a4-92bf-cc5a97331821",
            name: "Canon EOS R5 Mirrorless Camera",
            desc: "High-resolution mirrorless camera with 45MP full-frame sensor, DIGIC X image processor, 8K video, and advanced autofocus system.",
            imgSrc: "https://m.media-amazon.com/images/I/61FGU+Wyn4L._AC_SL1000_.jpg",
            rating: 4.7,
            price: 3499.99,
            slug: "canon_eos_r5_mirrorless_camera",
            forCategory: "cameras"
        },
        {
            id: "b11eacc1-b611-4c6f-b9d6-9dc8b390fad4",
            name: "Fujifilm X-T4 Mirrorless Camera",
            desc: "Advanced mirrorless camera with 26.1MP X-Trans CMOS 4 sensor, X-Processor 4 image processor, 5-axis in-body image stabilization, and 4K video recording.",
            imgSrc: "https://m.media-amazon.com/images/I/71EWRyqzw0L._AC_SL1500_.jpg",
            rating: 4.8,
            price: 1699.99,
            slug: "fujifilm_x-t4_mirrorless_camera",
            forCategory: "cameras"
        },
        {
            id: "dc1c2974-b7ee-4c36-8fd6-27d9d8c8677c",
            name: "Sony A7S III Mirrorless Camera",
            desc: "Full-frame mirrorless camera optimized for video with 12.1MP sensor, BIONZ XR image processor, 4K video at up to 120fps, and 9.44 million-dot OLED EVF.",
            imgSrc: "https://m.media-amazon.com/images/I/711seEoUM9L._AC_SL1500_.jpg",
            rating: 4.9,
            price: 3499.99,
            slug: "sony_a7s_iii_mirrorless_camera",
            forCategory: "cameras"
        },
        {
            id: "03fda86b-2f02-4184-8a9a-32aa78d16889",
            name: "Nikon Z7 II Mirrorless Camera",
            desc: "High-resolution mirrorless camera with 45.7MP full-frame CMOS sensor, Dual EXPEED 6 image processors, 4K UHD video recording, and 5-axis in-body image stabilization.",
            imgSrc: "https://m.media-amazon.com/images/I/71zs+RZUggL._AC_SL1500_.jpg",
            rating: 4.7,
            price: 2999.99,
            slug: "nikon_z7_ii_mirrorless_camera",
            forCategory: "cameras"
        },
        {
            id: "444ce0cc-dc92-4ccc-8c38-2c3e1e1faa0d",
            name: "Panasonic Lumix GH5 Mark II Mirrorless Camera",
            desc: "Professional mirrorless camera with 20.3MP Micro Four Thirds sensor, Venus Engine image processor, 4K video recording at up to 60fps, and 5-axis Dual I.S. II image stabilization.",
            imgSrc: "https://m.media-amazon.com/images/I/81depb5FkhL._AC_SL1500_.jpg",
            rating: 4.8,
            price: 1799.99,
            slug: "panasonic_lumix_gh5_mark_ii_mirrorless_camera",
            forCategory: "cameras"
        },
        {
            id: "f3df3b2d-474b-4736-a58c-036a5f5e228e",
            name: "Sony RX100 VII Compact Camera",
            desc: "Advanced compact camera with 1-inch Exmor RS CMOS sensor, BIONZ X image processor, 24-200mm zoom lens, and Real-time Eye AF for humans and animals.",
            imgSrc: "https://m.media-amazon.com/images/I/71LG276t3aL._AC_SL1500_.jpg",
            rating: 4.9,
            price: 1299.99,
            slug: "sony_rx100_vii_compact_camera",
            forCategory: "cameras"
        },
        {
            id: "b1f0c897-aa63-4a46-9c0b-c8b7edcecf04",
            name: "Canon EOS R6 Mirrorless Camera",
            desc: "Full-frame mirrorless camera with 20.1MP CMOS sensor, DIGIC X image processor, 4K video recording, and 5-axis in-body image stabilization with up to 8 stops of shake correction.",
            imgSrc: "https://m.media-amazon.com/images/I/71VzbJ7oZLL._AC_SL1500_.jpg",
            rating: 4.7,
            price: 2499.99,
            slug: "canon_eos_r6_mirrorless_camera",
            forCategory: "cameras"
        },
        {
            id: "91aed8da-813f-48e5-bc47-7afd3f6a56c8",
            name: "Olympus OM-D E-M1 Mark III Mirrorless Camera",
            desc: "Pro-level mirrorless camera with 20.4MP Live MOS sensor, TruePic IX image processor, 5-axis in-body image stabilization, and weather-sealed construction for durability.",
            imgSrc: "https://m.media-amazon.com/images/I/71zTX1iQWSL._AC_SL1500_.jpg",
            rating: 4.6,
            price: 1799.99,
            slug: "olympus_om-d_e-m1_mark_iii_mirrorless_camera",
            forCategory: "cameras"
        }

    ],
    headphones: [
        {
            id: "fc672e29-3402-4be8-bcf2-5c5b07b7aec2",
            name: "AKG Acoustics N90Q",
            desc: "Together with dual foam cushions and ear cup mounted controls for auto-calibration, TruNote allows precision sound reproduction.",
            imgSrc: require(`@/public/projects/ecommerce/headphones bestseller 2.png`).default.src,
            rating: 4.9,
            price: 2999.99,
            bestSeller: true,
            slug: "akg_acoustics_n90q",
            forCategory: "headphones"
        },
    ],
}

