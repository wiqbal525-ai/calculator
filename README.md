# Musharaka Calculator Starter

This project now includes a standalone browser-based diminishing Musharaka calculator that you can run locally on your computer without Google Sheets.

It can also be published on GitHub Pages as a static site.

## Files

- `index.html` renders the calculator UI
- `styles.css` contains the layout and visual design
- `app.js` contains the financing logic, affordability summary, and schedule generator
- `Code.gs` and `appsscript.json` remain available if you later want a Google Sheets version

## How to run the local version

1. Open `index.html` in your browser.
2. Change the values in the financing input section.
3. Review the affordability cards and monthly schedule below.

No install step is required.

## Publish on GitHub Pages

This folder is ready to be deployed as a static GitHub Pages site.

### Steps

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. Push the repository to the `main` branch.
4. In GitHub, open `Settings > Pages`.
5. Under `Build and deployment`, set `Source` to `Deploy from a branch`.
6. Choose branch `main` and folder `/ (root)`.
7. Save and wait for GitHub Pages to publish the site.
8. Open the published site URL from the Pages settings screen.

### Notes

- The site uses relative file paths, so it works correctly on a GitHub Pages project site.
- If your default branch is not `main`, select that branch in the Pages settings instead.
- `.nojekyll` tells GitHub Pages to serve the site as plain static files.
- `Code.gs` and `appsscript.json` can stay in the repo, but they are not used by the static site.

## What the local version does

- Calculates financing amount from purchase price minus down payment
- Calculates monthly payment using a standard amortized payment formula
- Calculates stress-tested payment as financing amount divided by total months to match the screenshot logic
- Estimates required income from the stress-tested payment and qualification ratio
- Builds a full monthly schedule showing profit, share purchase, ending balance, approximate quarterly transfer, ownership, and prepayment
- Compares Musharaka against a conventional mortgage over time using the same purchase price, down payment, term, and monthly prepayment assumptions

## Important note

The quarterly transfer fields are still approximations derived from the screenshots, not a verified Manzil-equivalent model. You should compare one real sample schedule row by row if you need exact matching behavior.

## Current model assumptions

- Financing amount = purchase price - down payment
- Monthly payment uses a fixed rate across the full term
- Stress-tested payment = financing amount / term months
- Property tax is displayed separately and is not included in required-income qualification
- Client ownership = down payment plus cumulative share purchases divided by purchase price
- Monthly prepayment is applied every month until the balance reaches zero

## Recommended next refinements

1. Match the quarterly transfer formulas to a real Manzil sample schedule.
2. Add CSV export for the payment schedule.
3. Add charts for ownership growth and payoff balance.
4. Add support for variable rates or special prepayment events.
