.
├── AGENTS.md
├── app
│   ├── home.tsx
│   ├── index.tsx
│   ├── _layout.tsx
│   ├── lixeira
│   │   └── index.tsx
│   ├── modal.tsx
│   ├── notes
│   │   ├── [id].tsx
│   │   └── index.tsx
│   ├── photos
│   │   └── index.tsx
│   ├── recados
│   │   └── index.tsx
│   └── settings.tsx
├── app.json
├── assets
│   └── images
│       ├── android-icon-background.png
│       ├── android-icon-foreground.png
│       ├── android-icon-monochrome.png
│       ├── bg-gengar.png
│       ├── bg-kitty.png
│       ├── favicon.png
│       ├── icon.png
│       ├── partial-react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       ├── react-logo.png
│       └── splash-icon.png
├── CLAUDE.md
├── components
│   ├── Background.tsx
│   ├── FolderIcons.tsx
│   └── PostItGlyph.tsx
├── constants
│   ├── postItColors.ts
│   ├── ThemeContext.tsx
│   ├── theme.ts
│   └── users.ts
├── eas.json
├── eslint.config.js
├── expo-env.d.ts
├── google-services.json
├── hooks
│   ├── useActiveUser.ts
│   ├── useNotes.ts
│   ├── usePhotos.ts
│   └── usePostIts.ts
├── node_modules
│   ├── eslint -> .pnpm/eslint@9.39.4/node_modules/eslint
│   ├── eslint-config-expo -> .pnpm/eslint-config-expo@10.0.0_eslint@9.39.4_typescript@5.9.3/node_modules/eslint-config-expo
│   ├── @expo
│   │   └── vector-icons -> ../.pnpm/@expo+vector-icons@15.1.1_expo-font@14.0.12_expo@54.0.35_react-native@0.81.5_@babel+cor_e77cb8d2c5ebcdd004973413c2e800d6/node_modules/@expo/vector-icons
│   ├── expo -> .pnpm/expo@54.0.35_@babel+core@7.29.7_@expo+metro-runtime@6.1.2_expo-router@6.0.24_react-nati_058503f198001231e3481bdee78a6590/node_modules/expo
│   ├── expo-auth-session -> .pnpm/expo-auth-session@7.0.11_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+rea_71ca79248bbfebb3c34e45cc5ae6d970/node_modules/expo-auth-session
│   ├── expo-blur -> .pnpm/expo-blur@15.0.8_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0__react@19.1.0/node_modules/expo-blur
│   ├── expo-constants -> .pnpm/expo-constants@18.0.13_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0_/node_modules/expo-constants
│   ├── expo-crypto -> .pnpm/expo-crypto@15.0.9_expo@54.0.35/node_modules/expo-crypto
│   ├── expo-dev-client -> .pnpm/expo-dev-client@6.0.21_expo@54.0.35/node_modules/expo-dev-client
│   ├── expo-font -> .pnpm/expo-font@14.0.12_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0__react@19.1.0/node_modules/expo-font
│   ├── expo-haptics -> .pnpm/expo-haptics@15.0.8_expo@54.0.35/node_modules/expo-haptics
│   ├── expo-image -> .pnpm/expo-image@3.0.11_expo@54.0.35_react-native-web@0.21.2_react-dom@19.1.0_react@19.1.0__r_988519f86e1a2663b41d0d886cf6a383/node_modules/expo-image
│   ├── expo-image-picker -> .pnpm/expo-image-picker@17.0.11_expo@54.0.35/node_modules/expo-image-picker
│   ├── expo-linking -> .pnpm/expo-linking@8.0.12_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0__react@19.1.0/node_modules/expo-linking
│   ├── expo-notifications -> .pnpm/expo-notifications@0.32.17_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+r_1030a5d30508b4de79b0b66fadb97e67/node_modules/expo-notifications
│   ├── expo-router -> .pnpm/expo-router@6.0.24_@expo+metro-runtime@6.1.2_@types+react@19.1.17_expo-constants@18.0.1_68fcd37ecb84c074be66d1848e68a3e8/node_modules/expo-router
│   ├── expo-splash-screen -> .pnpm/expo-splash-screen@31.0.13_expo@54.0.35_typescript@5.9.3/node_modules/expo-splash-screen
│   ├── expo-status-bar -> .pnpm/expo-status-bar@3.0.9_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0__react@19.1.0/node_modules/expo-status-bar
│   ├── expo-symbols -> .pnpm/expo-symbols@1.0.8_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0_/node_modules/expo-symbols
│   ├── expo-system-ui -> .pnpm/expo-system-ui@6.0.9_expo@54.0.35_react-native-web@0.21.2_react-dom@19.1.0_react@19.1.0_1075178598aede65e4d8635c0530dce0/node_modules/expo-system-ui
│   ├── expo-web-browser -> .pnpm/expo-web-browser@15.0.11_expo@54.0.35_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0_/node_modules/expo-web-browser
│   ├── react -> .pnpm/react@19.1.0/node_modules/react
│   ├── react-dom -> .pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom
│   ├── react-native -> .pnpm/react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0/node_modules/react-native
│   ├── @react-native-async-storage
│   │   └── async-storage -> ../.pnpm/@react-native-async-storage+async-storage@2.2.0_react-native@0.81.5_@babel+core@7.29.7__396e9a83766428d8988eeb7f16293a35/node_modules/@react-native-async-storage/async-storage
│   ├── @react-native-firebase
│   │   ├── app -> ../.pnpm/@react-native-firebase+app@26.3.2_@react-native-async-storage+async-storage@2.2.0_react_880f3aa50498d066686004e618cfd2be/node_modules/@react-native-firebase/app
│   │   ├── auth -> ../.pnpm/@react-native-firebase+auth@26.3.2_@react-native-firebase+app@26.3.2_@react-native-asyn_a8859113b19dc1c087c5be656036a2b6/node_modules/@react-native-firebase/auth
│   │   └── firestore -> ../.pnpm/@react-native-firebase+firestore@26.3.2_@react-native-firebase+app@26.3.2_@react-native_5a36ae413542156d724e030067dbee92/node_modules/@react-native-firebase/firestore
│   ├── react-native-gesture-handler -> .pnpm/react-native-gesture-handler@2.28.0_react-native@0.81.5_@babel+core@7.29.7_@types+react_be99934ea49bb53ff69ebeabbffac55b/node_modules/react-native-gesture-handler
│   ├── @react-native-google-signin
│   │   └── google-signin -> ../.pnpm/@react-native-google-signin+google-signin@16.1.2_expo@54.0.35_react-native@0.81.5_@babe_f1f52854b8f5c2bbb64a0d436e0bdf8a/node_modules/@react-native-google-signin/google-signin
│   ├── react-native-reanimated -> .pnpm/react-native-reanimated@4.1.7_react-native-worklets@0.5.1_@babel+core@7.29.7_react-nati_a25ca2be2a5db57062540af0e600a676/node_modules/react-native-reanimated
│   ├── react-native-safe-area-context -> .pnpm/react-native-safe-area-context@5.6.2_react-native@0.81.5_@babel+core@7.29.7_@types+reac_a403bed5a2c0c91bdb8678b4a740f507/node_modules/react-native-safe-area-context
│   ├── react-native-screens -> .pnpm/react-native-screens@4.16.0_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0__react@19.1.0/node_modules/react-native-screens
│   ├── react-native-web -> .pnpm/react-native-web@0.21.2_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/react-native-web
│   ├── react-native-worklets -> .pnpm/react-native-worklets@0.5.1_@babel+core@7.29.7_react-native@0.81.5_@babel+core@7.29.7_@_13303774ccf484748da144617f43f8c9/node_modules/react-native-worklets
│   ├── @react-navigation
│   │   ├── bottom-tabs -> ../.pnpm/@react-navigation+bottom-tabs@7.17.2_@react-navigation+native@7.3.0_react-native@0.81.5_5eec7daa7ebd2d1a1f63ab6cdf76ca21/node_modules/@react-navigation/bottom-tabs
│   │   ├── elements -> ../.pnpm/@react-navigation+elements@2.9.22_@react-navigation+native@7.3.0_react-native@0.81.5_@b_b40432cffd9b3ef8d922484381da6c03/node_modules/@react-navigation/elements
│   │   └── native -> ../.pnpm/@react-navigation+native@7.3.0_react-native@0.81.5_@babel+core@7.29.7_@types+react@19.1.17_react@19.1.0__react@19.1.0/node_modules/@react-navigation/native
│   ├── @types
│   │   └── react -> ../.pnpm/@types+react@19.1.17/node_modules/@types/react
│   └── typescript -> .pnpm/typescript@5.9.3/node_modules/typescript
├── package.json
├── pnpm-lock.yaml
├── README.md
├── scripts
│   └── reset-project.js
├── services
│   ├── auth
│   │   └── googleAuth.ts
│   ├── drive
│   │   ├── appDataSyncService.ts
│   │   ├── driveClient.ts
│   │   └── photoService.ts
│   ├── firestore
│   │   ├── firestoreClient.ts
│   │   ├── notesService.ts
│   │   ├── photosService.ts
│   │   ├── postItsService.ts
│   │   └── pushTokensService.ts
│   ├── notifications
│   │   └── pushTokenService.ts
│   └── sync
│       ├── purgeExpiredItems.ts
│       └── tombstones.ts
├── storage
│   ├── googleAuth.ts
│   ├── keys.ts
│   ├── notes.ts
│   └── user.ts
├── struct.md
├── tsconfig.json
└── types
    └── index.ts

66 directories, 63 files
