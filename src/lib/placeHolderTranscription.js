export const getPlaceholderTranscription = () => {
  const transcriptionParts = [
    `
    # Transcription of Hearing: Smith v. Greenfield Industries Ltd.
    ## Environmental Pollution Case
    ### Date: 15 May 2024
    ### Time: 10:00 AM - 11:00 AM
    ### Location: Cape Town High Court
    
    [00:00:00] Court Clerk: All rise. The Cape Town High Court is now in session, the Honourable Judge Nomvula Khumalo presiding.
    
    [00:00:10] Judge Khumalo: Please be seated. We're here today for the case of Smith v. Greenfield Industries Ltd. This is a hearing regarding the alleged environmental pollution caused by the defendant's manufacturing plant. Are both parties present and ready to proceed?
    
    [00:00:30] Mr. Botha (Plaintiff's Counsel): Yes, Your Honour. Jonathan Botha representing the plaintiff, Sarah Smith.
    
    [00:00:38] Ms. Naidoo (Defendant's Counsel): Yes, Your Honour. Priya Naidoo for the defendant, Greenfield Industries Ltd.
    
    [00:00:45] Judge Khumalo: Very well. Mr. Botha, you may present your opening statement.
    
    [00:00:52] Mr. Botha: Thank you, Your Honour. Ladies and gentlemen, we are here today because Greenfield Industries Ltd. has consistently and recklessly polluted the Silvermine River, causing irreparable harm to the local ecosystem and the livelihoods of residents who depend on it. My client, Sarah Smith, a fifth-generation farmer, has seen her crops wither and her livestock fall ill due to the contaminated water from the river that runs through her property.
    
    [00:01:30] Mr. Botha: We will present evidence that clearly shows Greenfield Industries has been disposing of toxic waste into the river for the past five years, in direct violation of environmental regulations. This negligence has not only affected Ms. Smith's farm but has also impacted the entire community's access to clean water and safe recreational areas.
    
    [00:02:00] Mr. Botha: Your Honour, by the end of this hearing, we will prove beyond doubt that Greenfield Industries must be held accountable for their actions, made to clean up the river, and provide compensation to those affected by their irresponsible behaviour. Thank you.
    
    [00:02:20] Judge Khumalo: Thank you, Mr. Botha. Ms. Naidoo, your opening statement, please.
    
    [00:02:27] Ms. Naidoo: Thank you, Your Honour. While we sympathise with Ms. Smith's situation, Greenfield Industries Ltd. vehemently denies the allegations brought against us. Our company has been a cornerstone of this community for over three decades, providing employment and contributing to the local economy.
    
    [00:02:50] Ms. Naidoo: We will demonstrate that Greenfield Industries has always operated within the bounds of environmental law and has consistently passed all government inspections. The pollution in the Silvermine River, regrettable as it is, cannot be conclusively linked to our client's operations.
    
    [00:03:15] Ms. Naidoo: Furthermore, we will present evidence showing that there are multiple industrial and agricultural operations upstream from Ms. Smith's property, any of which could be the source of the alleged contamination. It would be unjust to hold Greenfield Industries solely responsible without concrete proof of wrongdoing.
    
    [00:03:40] Ms. Naidoo: Your Honour, by the conclusion of this hearing, we are confident that you will find Greenfield Industries Ltd. has acted in good faith and in compliance with all relevant environmental regulations. Thank you.
    
    [00:03:55] Judge Khumalo: Thank you, Ms. Naidoo. Mr. Botha, you may call your first witness.
    `,
    `
    [00:04:05] Mr. Botha: Your Honour, I'd like to call Dr. Emma Kgosi, environmental scientist, to the stand.
    
    [00:04:15] Court Clerk: Dr. Emma Kgosi, please approach the witness stand. Do you swear to tell the truth, the whole truth, and nothing but the truth?
    
    [00:04:25] Dr. Kgosi: I do.
    
    [00:04:28] Mr. Botha: Dr. Kgosi, could you please state your qualifications for the court?
    
    [00:04:33] Dr. Kgosi: Certainly. I have a PhD in Environmental Science from the University of Cape Town, with a specialisation in water pollution. I've been working in the field for 15 years and have published numerous peer-reviewed papers on industrial pollution in South African waterways.
    
    [00:04:55] Mr. Botha: Thank you, Dr. Kgosi. Can you tell us about your analysis of the Silvermine River?
    
    [00:05:02] Dr. Kgosi: Of course. I conducted a comprehensive analysis of water samples taken from various points along the Silvermine River over a six-month period. The results show alarming levels of heavy metals, particularly lead and cadmium, as well as organic pollutants consistent with industrial waste.
    
    [00:05:25] Mr. Botha: And in your professional opinion, what is the source of these pollutants?
    
    [00:05:30] Dr. Kgosi: Based on the concentration gradient of pollutants and their chemical composition, the data strongly suggests that the primary source of pollution is located near the Greenfield Industries plant. The types of pollutants found are also consistent with those typically produced in electronics manufacturing processes.
    
    [00:05:55] Mr. Botha: Thank you, Dr. Kgosi. Could you elaborate on the potential environmental impact of these pollutants?
    
    [00:06:03] Dr. Kgosi: Certainly. The levels of pollutants we've detected can have severe and long-lasting effects on the ecosystem. We're seeing a decline in aquatic life, with certain fish species disappearing entirely from affected areas. The pollutants are also accumulating in the soil of surrounding farmlands, which can lead to crop failures and health risks for livestock and humans consuming produce from these areas.
    
    [00:06:35] Mr. Botha: No further questions, Your Honour.
    
    [00:06:40] Judge Khumalo: Ms. Naidoo, your witness.
    
    [00:06:45] Ms. Naidoo: Thank you, Your Honour. Dr. Kgosi, in your analysis, did you consider other potential sources of pollution upstream from Greenfield Industries?
    
    [00:06:55] Dr. Kgosi: Yes, we did consider other potential sources. However, the concentration and types of pollutants are most consistent with electronics manufacturing processes.
    
    [00:07:10] Ms. Naidoo: But you can't definitively rule out other sources, can you?
    
    [00:07:15] Dr. Kgosi: While we can't rule them out with 100% certainty, the evidence overwhelmingly points to Greenfield Industries as the primary source.
    
    [00:07:25] Ms. Naidoo: Dr. Kgosi, are you aware that Greenfield Industries has passed all government environmental inspections in the past five years?
    
    [00:07:35] Dr. Kgosi: I'm aware of that, yes.
    
    [00:07:40] Ms. Naidoo: And isn't it possible that the pollutants you found could have accumulated over a much longer period, predating Greenfield Industries' operations in the area?
    
    [00:07:50] Dr. Kgosi: While historical pollution can persist, the levels and distribution we're seeing are indicative of ongoing, recent contamination.
    
    [00:08:00] Ms. Naidoo: No further questions, Your Honour.
    
    [00:08:05] Judge Khumalo: Mr. Botha, do you have any redirect?
    
    [00:08:10] Mr. Botha: No, Your Honour.
    
    [00:08:12] Judge Khumalo: Dr. Kgosi, you may step down. Mr. Botha, call your next witness.
    `,
    `
    [00:08:20] Mr. Botha: Your Honour, I'd like to call the plaintiff, Sarah Smith, to the stand.
    
    [00:08:25] Court Clerk: Sarah Smith, please approach the witness stand. Do you swear to tell the truth, the whole truth, and nothing but the truth?
    
    [00:08:35] Sarah Smith: I do.
    
    [00:08:38] Mr. Botha: Ms. Smith, can you please tell the court about your farm and its relationship to the Silvermine River?
    
    [00:08:45] Sarah Smith: Yes, of course. Our family has owned and operated Riverside Farm for five generations now. It's a 200-hectare property that borders the Silvermine River for about 2 kilometres. We've always relied on the river for irrigation and as a water source for our livestock.
    
    [00:09:05] Mr. Botha: And how has the condition of the river changed in recent years?
    
    [00:09:10] Sarah Smith: It's been devastating to watch. About five years ago, we started noticing changes. The water became cloudy and had an odd smell. We saw fewer fish, and the reeds along the banks started dying off. But the real problems began about three years ago.
    
    [00:09:30] Mr. Botha: Can you elaborate on these problems?
    
    [00:09:35] Sarah Smith: Yes. Our crop yields began to drop dramatically. The maize and wheat we've grown successfully for decades started showing signs of stunted growth and discolouration. We've had to reduce our cultivated area by almost half because the crops just won't grow properly in some fields anymore.
    
    [00:10:00] Sarah Smith: But it's not just the crops. Our livestock has been affected too. We've seen an increase in unexplained illnesses among our cattle. Last year, we lost a third of our herd to a mysterious ailment that our vet believes is linked to the water quality.
    
    [00:10:20] Mr. Botha: How has this affected your livelihood and that of your employees?
    
    [00:10:25] Sarah Smith: It's been incredibly difficult. Our income has dropped by more than 60% over the past three years. We've had to let go of half of our farmhands because we simply can't afford to pay them anymore. These are people whose families have worked alongside ours for generations. It's heartbreaking.
    
    [00:10:50] Mr. Botha: Have you attempted to address this issue with Greenfield Industries directly?
    
    [00:10:55] Sarah Smith: Yes, multiple times. I've written letters, made phone calls, and even tried to arrange meetings with their management. But they've consistently denied any responsibility and refused to discuss the matter further.
    
    [00:11:15] Mr. Botha: Thank you, Ms. Smith. No further questions, Your Honour.
    
    [00:11:20] Judge Khumalo: Ms. Naidoo, your witness.
    
    [00:11:25] Ms. Naidoo: Thank you, Your Honour. Ms. Smith, you mentioned that you first noticed changes in the river about five years ago. Isn't it true that there was a severe drought in the region during that time?
    
    [00:11:40] Sarah Smith: Yes, there was a drought, but we've faced droughts before without these kinds of problems.
    
    [00:11:50] Ms. Naidoo: And isn't it possible that the drought, combined with your continued farming practices, could have contributed to the degradation of the soil and water quality?
    
    [00:12:00] Sarah Smith: I suppose it's possible, but we've always used sustainable farming practices, and we've never seen anything like this before.
    
    [00:12:10] Ms. Naidoo: Ms. Smith, are you aware of any other industrial or agricultural operations upstream from your property?
    
    [00:12:20] Sarah Smith: There are a few smaller farms upstream, yes.
    
    [00:12:25] Ms. Naidoo: And have you considered that these operations might be contributing to the pollution you're experiencing?
    
    [00:12:35] Sarah Smith: We've always had good relationships with our neighbouring farms. They're facing similar issues to us. It's only since Greenfield Industries expanded their operations that we've seen these problems.
    
    [00:12:50] Ms. Naidoo: But you can't be certain that Greenfield Industries is the sole cause of your problems, can you?
    
    [00:13:00] Sarah Smith: I'm not a scientist, but I know my land. And I know that these problems coincide with Greenfield's expansion.
    
    [00:13:10] Ms. Naidoo: No further questions, Your Honour.
    
    [00:13:15] Judge Khumalo: Mr. Botha, any redirect?
    
    [00:13:20] Mr. Botha: No, Your Honour.
    
    [00:13:22] Judge Khumalo: Ms. Smith, you may step down. We'll take a 15-minute recess before continuing with the defence's witnesses.
    
    [00:13:30] Court Clerk: All rise.
    `,
    `
    [00:28:30] Court Clerk: All rise. Court is back in session, Judge Nomvula Khumalo presiding.
    
    [00:28:40] Judge Khumalo: Please be seated. Ms. Naidoo, you may call your first witness.
    
    [00:28:45] Ms. Naidoo: Thank you, Your Honour. The defence calls Mr. David van der Merwe, Environmental Compliance Officer at Greenfield Industries Ltd.
    
    [00:28:55] Court Clerk: Mr. van der Merwe, please approach the witness stand. Do you swear to tell the truth, the whole truth, and nothing but the truth?
    
    [00:29:05] Mr. van der Merwe: I do.
    
    [00:29:08] Ms. Naidoo: Mr. van der Merwe, could you please state your position and responsibilities at Greenfield Industries?
    
    [00:29:15] Mr. van der Merwe: Certainly. I'm the Environmental Compliance Officer at Greenfield Industries. I've held this position for the past seven years. My responsibilities include ensuring that our operations comply with all relevant environmental regulations, overseeing our waste management processes, and liaising with government inspectors during their visits.
    
    [00:29:40] Ms. Naidoo: Thank you. Can you tell the court about Greenfield Industries' environmental policies and practices?
    
    [00:29:48] Mr. van der Merwe: Of course. At Greenfield, we take our environmental responsibilities very seriously. We have a comprehensive Environmental Management System in place that goes beyond mere compliance with regulations. We use state-of-the-art filtration and water treatment technologies in our manufacturing processes. All our waste is treated on-site before being disposed of through licensed waste management contractors.
    
    [00:30:20] Ms. Naidoo: How often is your facility inspected by government environmental agencies?
    
    [00:30:25] Mr. van der Merwe: We undergo thorough inspections twice a year by the Department of Environment, Forestry and Fisheries. Additionally, we conduct our own monthly internal audits and quarterly third-party audits to ensure continuous compliance.
    
    [00:30:45] Ms. Naidoo: And what have been the results of these inspections?
    
    [00:30:50] Mr. van der Merwe: I'm proud to say that we have passed every single inspection over the past five years with flying colours. We've even received commendations from the Department for our proactive approach to environmental management.
    
    [00:31:05] Ms. Naidoo: Mr. van der Merwe, are you aware of the allegations of river pollution made against Greenfield Industries?
    
    [00:31:12] Mr. van der Merwe: Yes, I am, and we take these allegations very seriously. However, based on our rigorous monitoring and control systems, I can confidently say that Greenfield Industries is not the source of the pollution in the Silvermine River.
    
    [00:31:30] Ms. Naidoo: Can you elaborate on why you're so confident?
    
    [00:31:35] Mr. van der Merwe: Certainly. We have continuous monitoring systems in place that measure the quality of any water leaving our facility. These systems would immediately alert us if there were any anomalies in water quality. We've reviewed all our data for the past five years, and there have been no instances where our discharge exceeded the permitted levels for any pollutants.
    
    [00:32:00] Ms. Naidoo: Thank you, Mr. van der Merwe. No further questions, Your Honour.
    
    [00:32:05] Judge Khumalo: Mr. Botha, your witness.
    
    [00:32:10] Mr. Botha: Thank you, Your Honour. Mr. van der Merwe, you mentioned that Greenfield Industries uses "state-of-the-art" filtration and water treatment technologies. When was the last time these systems were upgraded?
    
    [00:32:25] Mr. van der Merwe: We perform regular maintenance and upgrades on our systems. The last major upgrade was approximately three years ago.
    
    [00:32:35] Mr. Botha: Three years ago. Interestingly, that coincides with when Ms. Smith reported the most severe changes in the river. Can you explain this timing?
    
    [00:32:45] Mr. van der Merwe: The timing is purely coincidental. Our upgrades were part of our continuous improvement process, not a response to any issues.
    
    [00:32:55] Mr. Botha: Mr. van der Merwe, are you aware that the type of pollutants found in the river are consistent with those used in your manufacturing processes?
    
    [00:33:05] Mr. van der Merwe: I'm aware of the allegations, yes. However, many industries use similar chemicals. It doesn't prove that we're the source.
    
    [00:33:15] Mr. Botha: But you are the largest industrial operation in the immediate vicinity of the affected area, correct?
    
    [00:33:22] Mr. van der Merwe: Yes, that's correct.
    
    [00:33:25] Mr. Botha: One last question, Mr. van der Merwe. Has Greenfield Industries ever considered conducting its own independent study of the river to verify that you're not the source of pollution?
    
    [00:33:40] Mr. van der Merwe: We believe that our internal monitoring systems and the regular government inspections are sufficient to ensure our compliance.
    
    [00:33:50] Mr. Botha: So, that's a no. No further questions, Your Honour.
    
    [00:33:55] Judge Khumalo: Ms. Naidoo, any redirect?
    
    [00:34:00] Ms. Naidoo: No, Your Honour.
    
    [00:34:03] Judge Khumalo: Mr. van der Merwe, you may step down. Ms. Naidoo, call your next witness.
    `,
    `
    [00:34:10] Ms. Naidoo: Your Honour, the defence rests.
    
    [00:34:15] Judge Khumalo: Thank you, Ms. Naidoo. We'll now proceed to closing arguments. Mr. Botha, you may begin.
    
    [00:34:25] Mr. Botha: Thank you, Your Honour. Ladies and gentlemen, over the course of this hearing, we have presented clear and compelling evidence that Greenfield Industries Ltd. is responsible for the pollution of the Silvermine River and the subsequent devastation to the surrounding environment and community.
    
    [00:34:45] Mr. Botha: Dr. Kgosi, a respected environmental scientist, provided expert testimony showing alarmingly high levels of pollutants in the river, consistent with those used in Greenfield's manufacturing processes. The concentration gradient of these pollutants points directly to Greenfield's facility as the source.
    
    [00:35:10] Mr. Botha: We've heard heart-wrenching testimony from Sarah Smith, whose family farm has been devastated by this pollution. Her crops are failing, her livestock is dying, and her livelihood is in jeopardy. And she is not alone – an entire community is suffering because of Greenfield's negligence.
    
    [00:35:30] Mr. Botha: While Greenfield Industries claims to have state-of-the-art environmental protections in place, they have provided no concrete evidence to refute the scientific findings presented by Dr. Kgosi. Their reliance on government inspections and internal monitoring is clearly insufficient to prevent this environmental disaster.
    
    [00:35:55] Mr. Botha: Your Honour, the evidence is clear. Greenfield Industries must be held accountable for their actions. We ask that you find in favour of the plaintiff, mandate an immediate cleanup of the Silvermine River, and award damages to compensate Ms. Smith and the affected community for their losses. Thank you.
    
    [00:36:20] Judge Khumalo: Thank you, Mr. Botha. Ms. Naidoo, your closing argument.
    
    [00:36:25] Ms. Naidoo: Thank you, Your Honour. Throughout this hearing, we have demonstrated that Greenfield Industries Ltd. is a responsible corporate citizen that has consistently operated within the bounds of environmental law.
    
    [00:36:40] Ms. Naidoo: Mr. van der Merwe's testimony clearly outlined the rigorous environmental management systems in place at Greenfield. The company has passed every government inspection with flying colours and even received commendations for their proactive approach to environmental protection.
    
    [00:37:00] Ms. Naidoo: While we sympathise with Ms. Smith's situation, there is no concrete evidence linking Greenfield Industries to the pollution in the Silvermine River. The plaintiff's case relies heavily on circumstantial evidence and speculation.
    
    [00:37:20] Ms. Naidoo: We must not overlook other potential sources of pollution, including other industrial operations and agricultural runoff from farms upstream. The drought mentioned earlier could also be a significant contributing factor to the environmental changes observed.
    
    [00:37:40] Ms. Naidoo: Your Honour, in the absence of definitive proof linking Greenfield Industries to the river pollution, it would be unjust to hold the company responsible. We ask that you dismiss the case against Greenfield Industries Ltd. Thank you.
    
    [00:38:00] Judge Khumalo: Thank you, Ms. Naidoo. Before we conclude, I'd like to make a few remarks.
    
    [00:38:10] Judge Khumalo: This case highlights the delicate balance between industrial progress and environmental protection – a challenge that is particularly pertinent in our nation as we strive for economic growth while safeguarding our natural heritage.
    
    [00:38:30] Judge Khumalo: The evidence presented today raises serious concerns about the health of the Silvermine River and its impact on the surrounding community. Regardless of the outcome of this specific case, it is clear that immediate action is needed to address the pollution and its effects.
    
    [00:38:55] Judge Khumalo: I will carefully review all the evidence presented today, including the expert testimony, environmental data, and personal accounts. Given the complexity of the case and the potential far-reaching implications of the decision, I will reserve judgement for now.
    
    [00:39:20] Judge Khumalo: I expect to deliver a verdict within 14 days. In the meantime, I strongly urge all parties involved, including Greenfield Industries and the local environmental agencies, to work together on an immediate plan to assess and mitigate the pollution in the Silvermine River.
    
    [00:39:45] Judge Khumalo: This court is now adjourned.
    
    [00:39:50] Court Clerk: All rise.
    
    [00:40:00] [End of transcription]
    `,
  ];

  return transcriptionParts.map((content, index) => ({
    fileName: `hearing_part_${index + 1}.txt`,
    content: {
      combinedRecognizedPhrases: [
        {
          display: content,
        },
      ],
      recognizedPhrases: [
        {
          offsetInTicks: 0,
          durationInTicks: 7200000000,
          speaker: 1,
          nBest: [
            {
              display: content,
              words: content.split(' '),
            },
          ],
        },
      ],
    },
  }));
};
