## CV-info

Web app for **ATS-style CV feedback**: upload a PDF, add the role and job description you are targeting, and get structured scores and improvement tips powered by AI.

### Stack

- **React 19** + **React Router 7** + **TypeScript** + **Vite** + **Tailwind CSS** + **Zustand** (client state) + **Puter.js** (sign-in, 
  cloud file storage, and AI APIs calls) + **Vitest**, **Playwright** (testing) 

### Prerequisites

- Node.js 20+ recommended
- npm 10+

### Setup

```bash
npm install
npm run dev
```


## How it works 

1. Users sign in using **Puter** 
2. On **Upload**, the user provides company, target job title, job description, and a **PDF** file (CV)
3. The CV is then analysed using Puter AI
4. Feedback returned back to the user's dashboard


<img width="1581" height="959" alt="Screenshot 2026-05-09 at 3 32 33 am" src="https://github.com/user-attachments/assets/50333857-a0ad-4edf-99bf-59906be622d0" />


:100:
