NOURISH — INSTALLABLE PERSONAL NUTRITION APP
=============================================

WHAT IS INCLUDED
----------------
Nourish is a mobile-first Progressive Web App. It includes a public introduction,
private nutrition dashboard, first-time setup, meal and water logging, a starter
food library, custom foods, contextual recommendations, weekly insights, local
backup and restore, dark mode, offline support, and Nourish Coach. The Log screen
also includes private camera capture and free on-device image classification. Its
115-item library covers staple foods, Indian meals, treats, packaged brands,
fruits, and vegetables.

No Node.js, npm, framework, build step, or package installation is required.


PUBLISH ON HOSTINGER
--------------------
1. Sign in to Hostinger hPanel and open File Manager for your domain.
2. Open public_html.
3. Upload every file and folder from this Nourish directory, preserving the
   existing structure.
4. Make sure SSL/HTTPS is enabled for the domain. Phone installation and offline
   support require HTTPS.
5. Visit the domain once, complete setup, then use Install Nourish or your
   browser's Add to Home Screen command.

On iPhone: open Nourish in Safari, tap Share, then Add to Home Screen.
On Android: open Nourish in Chrome and choose Install app when prompted.


ENABLE LIVE NOURISH COACH
-------------------------
Nourish already has useful offline, rule-based guidance. A live AI connection
requires an OpenAI API project and is billed separately by OpenAI based on usage.

The API key must never be pasted into app.html, JavaScript, or any public file.

Recommended Hostinger setup:
1. Create a project API key at https://platform.openai.com/api-keys
2. In hPanel, use a server environment variable named OPENAI_API_KEY if your plan
   supports environment variables. You may optionally set OPENAI_MODEL.
3. If environment variables are unavailable, copy
   deployment/nourish-secrets.example.php, rename the copy to
   nourish-secrets.php, add the key, and upload that completed file ONE DIRECTORY
   ABOVE public_html. Never place it inside public_html.
4. The public api/coach.php file automatically checks the environment first and
   then that private server file. No additional code changes are required.

The default model is gpt-5.6-luna. Change OPENAI_MODEL or the private configuration
value if your OpenAI project uses another compatible Responses API model.


PERSONAL DATA
-------------
Core profile, meal, water, custom food, settings and recent Coach history are
stored on the device in browser storage. Use Profile > Export backup regularly.
Clearing site data or uninstalling a browser may remove local information.

Meal photos selected through the camera are processed in the browser and are not
uploaded by Nourish. The first scan downloads TensorFlow.js and a small MobileNet
classification model from public CDNs. Visual matches and portion estimates can
be wrong, especially for mixed dishes, so the user always confirms a library item
and serving before it is logged.

Live Coach requests send only the current question, recent conversation, dietary
preference, declared allergens, and a limited summary of daily totals and targets.
They do not send a name or exact body measurements.


NUTRITION VALUES
----------------
The starter library contains approximate serving values informed by USDA FoodData
Central. Brands, preparation methods and actual portions vary. Use Custom foods to
enter exact values from packaging when precision matters.

Nourish provides general wellness estimates and does not replace a clinician or
registered dietitian. Seek professional guidance for pregnancy, medical conditions,
medications, severe allergies, or eating-disorder concerns.


PROJECT STRUCTURE
-----------------
index.html                     Public introduction and installation page
app.html                       Private app interface
privacy.html                   Privacy and wellness guidance
manifest.webmanifest           Phone installation metadata
sw.js                          Offline application shell
.htaccess                      Security and caching headers for Apache/Hostinger

assets/css/styles.css          Complete responsive visual system
assets/js/data.js              Starter food library
assets/js/storage.js           On-device data, backup and restore
assets/js/nutrition.js         Targets, totals and recommendation engine
assets/js/coach.js             Live AI connection and offline Coach
assets/js/camera.js            Camera capture and on-device food suggestions
assets/js/app.js               App screens and interactions
assets/js/landing.js           Landing animations and installation flow
assets/icons/                  App and home-screen icons
assets/images/                 Social sharing visual

api/coach.php                  Secure server-side OpenAI connection
deployment/                    Private configuration example only


UPDATING THE OFFLINE APP
------------------------
When publishing a future version, change CACHE_NAME near the top of sw.js. This
causes installed copies to refresh their cached app files.
