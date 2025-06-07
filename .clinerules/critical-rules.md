# Directory Project Critical Rules

## FOLLOW THIS AT ALL TIMES [CRITICAL COMPLIANCE REQUIRED]
## MAIN RULES [CRITICAL]:

## Project Structure

The App is made up of 2 main sections and each section has its own sidebar. The dashboard is the backend for the user. The homepage is the frontend for the user. 

- The Homepage (src/app/home)
- The Dashboard (src/app/dashboard)

## Development Guidelines

- BREAK DOWN ELEMENTS INTO SMALLER COMPONENTS AT ALL TIME
- ORGANISE THE FILE STRUCTURE INTO FOLDERS FOR EASY NAVIGATION
- QUESTION YOUR APPROACH AND PLAY DEVILS ADVOCATE
- ONLY FOLLOW MY LATEST PROMPT AT ALL TIMES
- FOLLOW THE FILE STRUCTURE BELOW

## File Structure

```
TuneFlow/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Main application routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── home/            # Homepage sections
│   │   ├── files/           # File management
│   │   ├── upload/          # Upload functionality
│   │   └── user/            # User profile
│   ├── components/          # Reusable components
│   │   ├── @/               # UI component library
│   │   ├── audio/           # Audio player components
│   │   ├── auth/            # Auth forms and routes
│   │   ├── blocks/          # Page sections
│   │   ├── dashboard/       # Dashboard components
│   │   ├── homepage/        # Homepage components
│   │   ├── profile/         # Profile components
│   │   ├── ui/              # Basic UI elements
│   │   └── upload/          # Upload components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utility functions
│   └── main.tsx             # Application entry point
├── .clinerules/             # Project-specific rules
├── package.json             # Project dependencies
└── vite.config.ts           # Build configuration
```
