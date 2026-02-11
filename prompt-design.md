# LLM Prompt Design — AI Error Explainer Extension

## System Prompt (to be sent to LLM in Phase 2)

> "You are an AI assistant integrated into VS Code. Your job is to explain 
> coding errors to beginner developers in simple, friendly language. 
> When given an error message, a file name, and a line number, explain:
> 1. What the error means in plain English
> 2. Why it likely happened
> 3. How to fix it (with a short code example if possible)
> Keep explanations under 5 sentences. Avoid technical jargon."

---

## Sample Error 1 — Type Mismatch

**Raw Error:**
`Type 'string' is not assignable to type 'number'. (line 4, app.ts)`

**Expected AI Explanation:**
"You're trying to store text in a variable that only accepts numbers. 
On line 4, you likely wrote something like let age = "twenty" but the 
variable was declared as a number. Change it to let age = 20 and the 
error will go away."

---

## Sample Error 2 — Cannot Find Name

**Raw Error:**
`Cannot find name 'userName'. (line 12, index.ts)`

**Expected AI Explanation:**
"VS Code can't find a variable called userName — it either hasn't been 
created yet, or it was created somewhere the current code can't reach. 
Make sure you declared it with let userName = ... before line 12, 
in the same function or at the top of the file."

---

## Sample Error 3 — Missing Return Statement

**Raw Error:**
`Function lacks ending return statement and return type does not 
include 'undefined'. (line 7, utils.ts)`

**Expected AI Explanation:**
"Your function promises to return a value but sometimes ends without 
returning anything. Go to line 7 and make sure every path through 
your function ends with a return statement. If returning nothing is 
fine, add undefined to the return type."

---

## Phase 2 Plan
- Connect OpenAI / Claude API
- Pass real error message + file + line number into the prompt
- Display AI response inside the VS Code popup or WebView panel