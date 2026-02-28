export interface TeamMessage {
  name: string;
  message: string;
  photos: string[]; // filenames — actual images to be added to /public/photos/
  photoCaption?: string;
  photoAfterParagraph?: number; // insert photos after this paragraph index (0-based)
  inlinePhotoCount?: number; // how many photos go inline (rest render below); defaults to all
  audio?: string; // filename in /public/music/
  postscript?: string; // grey placeholder text rendered after signature
  themeIndex: number; // index into CARD_THEMES array
}

export const messages: TeamMessage[] = [
  {
    name: "Bree",
    themeIndex: 2,
    message:
      "Sadly we don't have a photo together (we'll have to change that) but this is a pic of me accepting the role at Canary, harkening back to us having a spotty service conversation while I was on vacation. I won't forget the care you put into getting to know me and making me feel valued and excited about the role.\n\nThank you so much for being a great mentor and someone I can freely talk to and get advice from. And for being someone that also eats on camera without shame. You will be very missed \u2764\uFE0F",
    photos: ["bree1.jpg"],
  },
  {
    name: "Quinn",
    themeIndex: 16,
    message:
      "Aman, you are a thoughtful dude who can cut to the heart of an issue or opportunity, empowers the people around you to think big, and genuinely cares for the people around you.\n\nBut the memory that will stick out the most is the egregiously bad game of pop-a-shot we shared at Camp Canary. Whatever the opposite of \"on fire\" is, we were that.\n\nThanks for everything and best of luck.",
    photos: ["quinn1.jpg"],
  },
  {
    name: "Jess",
    themeIndex: 5,
    message:
      "Aman, It's so sad to see you go \u2014 I honestly can't imagine the Product Team without you. I'll always be grateful that you saw something in me and brought me onto the Canary team. That meant so much to me!\n\nThis is still one of my favorite team pictures. I had only been at Canary a few months \u2014 so excited for Camp Canary and trying to get all the details about those two days in Tarrytown. You told me it was going to be so much fun and that I'd definitely end up doing karaoke. I said \"absolutely not me\"\u2026 and of course I ended up on stage singing.\n\nThank you for the laughs, the encouragement, and for believing in me from the start. Wishing you the absolute best on your next adventure \u2014 I know you're going to crush it. \uD83D\uDC9B",
    photos: ["jess1.jpg", "jess2.jpg"],
    photoAfterParagraph: 0,
    inlinePhotoCount: 1,
  },
  {
    name: "Kevin",
    themeIndex: 3,
    message:
      "What a whirlwind 2 years its been, never thought that 10 years ago when we grabbed lunch at 1455 that we'd be working together at some point. Honestly crazy given all the overlaps that it didn't happen sooner but here we are\n\nThanks for pushing me to grow in ways I didn't expect, I'm a better PM as a result of working together with you and for that I'll always be grateful Everytime i see lenny's podcast i'll think of you! See you in montgomery soon!",
    postscript: "Was going to add a photo from HS but it ended up being embarrassing to both of us so just going to use this placeholder if you did want to see it; lmk",
    photos: [],
  },
  {
    name: "Sebastian",
    themeIndex: 12,
    message:
      "Aman, We were lucky to have you as a manager, leader, and mentor. Your passion for the Canary Product shone through every day. You pushed us to deliver our best work and stay on top of the rapidly evolving AI landscape - this encouragement helped me learn and grow tremendously in a short period of time, and I'm very grateful for that!\n\nI was also mightily impressed by your ravenous appetite. The image of you taking on that massive deep-fried calzone in Barcelona during the EMEA team summit is forever seared in my brain. That may be the only pizza you've ever given up on.\n\nDespite being an ocean away from most of the team, you always made me feel connected and included. Thank you for the great times and everything you taught me. Wishing you all the best in your next chapter.",
    photos: [],
  },
  {
    name: "Stephanie",
    themeIndex: 1,
    message:
      "Thank you for bringing me onto the team and for everything since. You've always been incredibly kind, and I'm especially grateful for the support you've shown me during some personally challenging moments.\n\nWishing you happiness and fulfillment in this next chapter.",
    photos: [],
  },
  {
    name: "Sage",
    themeIndex: 9,
    message:
      "Aman!! What a ride it's been! Thank you for everything you did to build out the product team including what I can only imagine must add up to almost a year of straight interviews.\n\nWe joined Canary around the same time as one another and I remember when I joined being extremely nervous to be seen as a partner to the leadership team. I remember our first 1:1 where you said I'm new too and us having a great conversation about what we wanted the partnership between hr and product to be and what your aspirations were for the team. If we run the numbers quick, I believe we started with a product team of 4/5 people and now we are 25+. Wow!!\n\nI will always appreciate your willingness to collaborate with me and us bouncing ideas off of each other. I am so grateful for the partnership, the dad jokes, and honestly, for you talking in huddle when there's a lull in conversation or shoutouts, plus you always willingly did sparkle fingers on the Amtrak train in public. That deserves a real shoutout.\n\nI'm sure we will stay in touch, and please know that wherever you end up next will be so lucky to have you. I can't wait to keep cheering you on!",
    photos: [],
  },
  {
    name: "Brad",
    themeIndex: 13,
    message:
      "I was three days away from signing on at Bloomberg when you asked me what it would take for me to cancel that meeting. I know you moved mountains to make the Canary hiring process go faster to get me onboard, and I'm forever grateful that you did because you helped me make one of my best decisions ever.\n\nThank you for everything!",
    photos: ["brad1.jpg"],
    photoCaption: "when this album dropped \uD83D\uDD25\uD83D\uDD25\uD83D\uDD25",
  },
  {
    name: "EJ",
    themeIndex: 0,
    message:
      "Aman, I have not know Canary without you and it truly feels like the end of an era, not just for this team, but the whole company. I am sad you are leaving, but I hope you take this time to enjoy your well-deserved break. After all, everyone needs space and time to recharge, reset, and reconnect with themselves, as you have tried to teach me!\n\nThank you for convincing me and allowing me to join your team and for investing in growth. You've taught me, not just about product, but about navigating work and life with perspective. You were the first manager to consistently help address that part of me and actively encourage me to prioritize it. That realization will forever stay with me, and I feel incredibly lucky to have learned it from you. I am especially grateful for the compassion and non-judgment you showed me during all of my early kiosk struggles.\n\nI am wishing you so much success and happiness in whatever comes next, both in work and life. Please keep me posted on your next chapter, and let's definitely get dairy and drinks together soon :)",
    photos: [],
  },
  {
    name: "Connor",
    themeIndex: 10,
    message:
      "Aman, thanks for being my intro into Canary and for being a source of guidance and driver of team culture over the last year! I'm sad to see you go, but know great things are ahead for you. I've always admired the personal touches you've applied throughout my time at Canary, whether that's your availability during my interview process, sending ice cream to all the new joiners, or sending a really sweet one year anniversary gift.\n\nWe'll miss you but know this is just the end of a chapter and not the end of the book. Stay in touch and looking forward to crossing paths again in the future!\n\n(I sadly don't have any photos of us together but hope you will enjoy reflecting on our super hacky v0 of kiosk that we demo'd where I picked up all the \"casing\" the night before at Target)",
    photos: ["connor1.jpg", "connor2.jpg", "connor3.jpg", "connor4.jpg"],
    photoAfterParagraph: 1,
  },
  {
    name: "Mehul",
    themeIndex: 14,
    message:
      "I know we had limited time to work together but it was great getting to know you! I will never forget the care package I got from you when I had bad Migraine. Sign of manager who cares for you as person.\n\nKeep leading with empathy as you did here and have a great success in your next adventure! Will miss you!",
    photos: [],
  },
  {
    name: "Marco",
    themeIndex: 19,
    message:
      "Hi Aman!\n\nI can't thank you enough for taking a chance on me 2.5 years ago as your first hire at Canary. Back then you painted a clear vision for how the Product Team and Canary would grow. It's safe to say you backed it up.\n\nI remember being the wide-eyed newbie designer on the team, mentioning to you that this was the biggest Product org I'd ever been a part of (which is crazy to say, I know). Since then we've only gotten bigger and upped the ante. I'm still in awe of the talented group of people you brought together, the products we've launched, and all the invaluable lessons.\n\nYour passion for this company, your honesty, and your mentorship will be dearly missed. But more importantly, we'll miss your annual karaoke performance of \"I Want It That Way\" and your dad jokes (which I honestly found hilarious. PJ says I have dad humor).\n\nOnto the next adventure. Don't be a stranger!\n\nBest,",
    photos: ["marco1.jpeg", "marco2.jpg", "marco3.jpg"],
    photoAfterParagraph: 3,
    inlinePhotoCount: 1,
    audio: "iwantitthatway.mp3",
  },
  {
    name: "Miguel",
    themeIndex: 6,
    message:
      "In 2024, I flew out to New York for the final round of interviews, which was something I had never done before. I really appreciated you bringing me in to meet everyone and see the magic at Canary firsthand. You put me at ease right away, and I left feeling completely sure this was a team I wanted to join.\n\nI came into the role pretty nervous, honestly! You helped build my confidence and pushed me to think beyond just design and really focus on Product and the bigger picture. You challenged me in the best way and helped me grow into a much stronger, more thoughtful designer. I'll always appreciate our conversations, your calm perspective during high-pressure moments, and your ability to keep things light when we needed it most. You've had a real impact on me.\n\nThanks for taking a chance on me. It's been genuinely life-changing. Wishing you all the best in what's next. Don't be a stranger, come say hi when you're in SF! \uD83D\uDE0A",
    photos: ["miguel1.jpg", "miguel2.jpg"],
  },
  {
    name: "Darshan",
    themeIndex: 7,
    message:
      "It's sad to see someone who convinced you to join the team leave. I only had a brief time and a few interactions with you, and I don't even have a memorable picture to share, but I truly admire the guidance and time I received from you.\n\nI still remember how quick and accommodating you were in converting me to a full-time employee after my internship, on Christmas Eve. Until 12 noon that day, I was sure I wasn't going to get the offer. I was literally watching people's green dots disappear on Slack, and somehow you made it happen the very same day.",
    photos: [],
  },
  {
    name: "Becca",
    themeIndex: 15,
    message:
      "My my my\u2026 where to begin. First of all, you're officially the longest manager I've ever had... that alone deserves an award. We've definitely had our ups and downs, and I think we've both grown a lot over our time working together. Thank you for always pushing me to the next level and supporting me through all my role progressions and changes. I've genuinely felt backed by you every step of the way, and I really appreciate everything you've done to help me get to where I am today. It was so refreshing to have a manager who had been through such a similar journey and could guide me along the \"happy\" path of what can be a pretty challenging ride. I hope I can pay that forward to others.\n\nOn a personal note, I'm really going to miss you. As disappointed as I am that you're Team Taylor instead of Team Dua, I've always loved our banter. You made work more fun! From me pity-laughing at your bad dad jokes to our heated debates about things that absolutely do not matter (literally just try Diet Pepsi).\n\nI truly wish you the very best in this next chapter. I'm so happy you're taking time for yourself. You'll be missed. \uD83E\uDD0D",
    photos: ["becca1.jpg"],
    photoAfterParagraph: 0,
    audio: "houdini.mp3",
  },
  {
    name: "Nico",
    themeIndex: 4,
    message:
      "Thank you, Aman, for giving me the opportunity to join the Canary team and kick off the French takeover! I'm truly grateful for the way you've pushed me to grow.\n\nI'll remember our great, sometimes heated, but always productive debates, as well as your thoughtful gestures along the way: the bottle at dinner on my signing day, the ice cream, and more recently, the tennis voucher! Thank you for everything, and don't be a stranger!",
    photos: [],
  },
  {
    name: "Rachel",
    themeIndex: 17,
    message:
      "Hey Aman, I just wanted to say how grateful I am for your leadership. Even in the seven months I've been here, you've pushed me to think bigger and hold a higher bar for myself and I've truly grown because of it!\n\nI'll never forget that random night at 7pm when we were still in the office and you showed me your Slack\u2026 and it looked like you were about to start an entirely new work day with 300+ unreads. I remember being both slightly horrified and incredibly impressed. It gave me a real appreciation for the level of ownership and intensity you bring every day.\n\nThank you for the trust, the candid feedback, and the steady guidance. You'll be missed, and I'm excited to see what you do next! Stay in touch!",
    photos: [],
  },
  {
    name: "Ani",
    themeIndex: 11,
    message:
      "Aman, It's hard to imagine Canary without you. Watching you build and scale the Product team over the years has been great to watch. The thoughtfulness and ambition you brought have shaped not just the product, but Canary. Canary wouldn't be what it is today without you.\n\nI'll always remember our onsite visit in Berlin to the Vienna House Potsdamer Platz and their very intense General Manager, and how we followed it up with a trip to the kebab shop.\n\nThank you for everything you've built here and the impact you've had on all of us. Excited to see what you do next, they're lucky to have you. Hopefully your future customer meetings are more exciting than this one we had with TUI at ITB Berlin.",
    photos: ["ani1.jpg"],
    photoAfterParagraph: 1,
  },
  {
    name: "Jake",
    themeIndex: 8,
    message:
      "Aman - I'm very grateful that you've brought me into the Canary family. From reaching out to me directly via text during the hiring process (definitely a differentiator lol) to being extremely open about WHY you were extending me an offer, the way you went about the process in a candid, yet professional manner really sold me during a time where I needed change.\n\nI've already learned so much from you over the past 3 months. One specific attribute I've noticed and have tried to emulate is how intent of a listener you are. It's always very apparent that you're giving your undivided attention to fully understand the situation & be able to respond appropriately or dive deeper. It's a hard skill to master the way you have.\n\nOn a separate note, I'm a bit disappointed we didn't get to have the Product field trip to Pura Vida\u2026maybe we can still make that happen down the road. You'll certainly be missed and I'm wishing you all the best! Let's stay in touch. Jake",
    photos: [],
  },
  {
    name: "Vibhor",
    themeIndex: 10,
    message:
      "Hey Aman - thanks for all the support, guidance, collaboration over the last year and half. It's been a pleasure working with you. I really appreciated your confidence in me, bringing me along on this ride. You've pushed me to be and do better, all throughout!\n\nSad to see you go - you'll definitely be missed. Will miss being surprised every time you joined our 1-1 call and said the first word haha. Good luck with all that's to come! Stay in touch! Vibhor",
    photos: ["vibhor1.jpg"],
  },
  {
    name: "Wenjun",
    themeIndex: 18,
    message:
      "Hi Aman,\n\nThanks for everything you did for Canary!\n\nThree years ago, Canary was a small company with a tiny product team. When I look back, I'm always amazed how far we've gone since you joined the company. Canary product team would've been very different without you.\n\nI've learned a lot over the last two years from you. You are a thoughtful product leader who always challenges us to raise the bar. Your line of questions have been guiding me to make every design decision. \u201CWhat would Aman ask and want to know?\u201D becomes my ritual to start any project.\n\nYou'll certainly be missed and best of luck!\n\nCheers,",
    photos: [],
  },
];
