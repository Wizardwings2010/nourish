(function () {
  "use strict";

  window.Nourish = window.Nourish || {};
  const exercises = [];

  function slug(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function add(type, muscle, equipment, cue, names) {
    names.split("|").forEach((name, index) => {
      const yogaLike = ["yoga", "mobility", "pilates"].includes(type);
      const cardio = ["cardio", "hiit"].includes(type);
      exercises.push({
        id: slug(`${type}-${muscle}-${name}`), name, type, muscle, equipment,
        level: index % 7 === 0 ? "advanced" : index % 3 === 0 ? "intermediate" : "beginner",
        sets: yogaLike ? 2 : cardio ? 4 : 3,
        reps: yogaLike ? "30–45 sec" : cardio ? "30 sec" : "8–12",
        rest: yogaLike ? 20 : cardio ? 30 : 75,
        cue: `${cue} Move through a pain-free range and keep every repetition controlled.`
      });
    });
  }

  add("strength", "chest", "barbell", "Keep your shoulder blades stable and drive through the chest.", "Barbell bench press|Incline barbell bench press|Decline barbell bench press|Close-grip bench press|Paused bench press|Spoto press|Floor press|Guillotine press|Reverse-grip bench press|Pin bench press|Board press|Tempo bench press");
  add("strength", "chest", "dumbbells", "Keep wrists stacked and lower the weights with control.", "Dumbbell bench press|Incline dumbbell press|Decline dumbbell press|Dumbbell floor press|Neutral-grip dumbbell press|Alternating dumbbell press|Dumbbell squeeze press|Dumbbell fly|Incline dumbbell fly|Decline dumbbell fly|Single-arm dumbbell press|Pullover");
  add("calisthenics", "chest", "bodyweight", "Brace your trunk and keep a straight line from head to heel.", "Push-up|Knee push-up|Incline push-up|Decline push-up|Wide push-up|Diamond push-up|Archer push-up|Pike push-up|Pseudo planche push-up|Clap push-up|Ring push-up|Deficit push-up|One-arm push-up progression|Hindu push-up");
  add("strength", "chest", "cable / machine", "Let the chest shorten fully without rolling the shoulders forward.", "Chest press machine|Incline chest press machine|Cable chest press|Single-arm cable press|Cable fly|Low-to-high cable fly|High-to-low cable fly|Pec deck|Plate squeeze press|Resistance-band chest press");

  add("strength", "back", "barbell", "Brace before pulling and keep the spine long.", "Conventional deadlift|Sumo deadlift|Romanian deadlift|Barbell row|Pendlay row|Underhand barbell row|Meadows row|T-bar row|Rack pull|Snatch-grip deadlift|Good morning|Barbell pullover");
  add("strength", "back", "dumbbells", "Pull the elbow toward the hip and avoid twisting the torso.", "One-arm dumbbell row|Chest-supported dumbbell row|Incline dumbbell row|Renegade row|Dumbbell pullover|Dumbbell seal row|Tripod dumbbell row|Dumbbell Romanian deadlift|Dumbbell shrug|Rear-delt dumbbell row");
  add("strength", "back", "cable / machine", "Lead with the elbows and pause briefly when the back is shortened.", "Lat pulldown|Wide-grip lat pulldown|Neutral-grip pulldown|Underhand pulldown|Single-arm lat pulldown|Straight-arm pulldown|Seated cable row|Wide cable row|Close cable row|Chest-supported machine row|High row machine|Low row machine|Cable pullover|Face pull|Reverse pec deck");
  add("calisthenics", "back", "bodyweight", "Start by setting the shoulder blades, then pull without swinging.", "Pull-up|Chin-up|Neutral-grip pull-up|Wide-grip pull-up|Commando pull-up|Scapular pull-up|Inverted row|Ring row|Towel pull-up|Negative pull-up|Assisted pull-up|Archer pull-up progression|Front lever row progression");

  add("strength", "quadriceps", "barbell", "Keep the whole foot planted and let knees track over toes.", "Back squat|Front squat|High-bar squat|Low-bar squat|Box squat|Pause squat|Tempo squat|Zercher squat|Anderson squat|Safety-bar squat|Barbell hack squat|Cyclist squat");
  add("strength", "legs", "dumbbells", "Stay balanced through the whole foot and control the lowering phase.", "Goblet squat|Dumbbell front squat|Dumbbell split squat|Bulgarian split squat|Dumbbell reverse lunge|Dumbbell walking lunge|Dumbbell lateral lunge|Dumbbell step-up|Dumbbell Romanian deadlift|Single-leg Romanian deadlift|Dumbbell sumo squat|Dumbbell calf raise");
  add("strength", "legs", "machine", "Set the machine to fit your joints and never bounce out of the bottom.", "Leg press|Single-leg press|Hack squat machine|Pendulum squat|Leg extension|Single-leg extension|Lying leg curl|Seated leg curl|Standing leg curl|Hip thrust machine|Glute drive machine|Smith machine squat|Smith split squat|Calf press|Seated calf raise|Standing calf raise|Hip abduction machine|Hip adduction machine");
  add("calisthenics", "legs", "bodyweight", "Keep the knee aligned with the toes and own each landing.", "Bodyweight squat|Jump squat|Split squat|Reverse lunge|Forward lunge|Walking lunge|Lateral lunge|Curtsy lunge|Cossack squat|Step-up|Single-leg box squat|Pistol squat progression|Wall sit|Glute bridge|Single-leg glute bridge|Hamstring walkout|Nordic curl progression|Donkey kick|Fire hydrant|Single-leg calf raise");

  add("strength", "shoulders", "barbell", "Brace the ribs down and press without leaning back.", "Standing overhead press|Seated overhead press|Push press|Behind-neck press|Bradford press|Z press|Landmine press|Barbell front raise|Barbell upright row|Snatch-grip high pull");
  add("strength", "shoulders", "dumbbells", "Use a smooth arc and stop before the shoulders shrug.", "Dumbbell shoulder press|Arnold press|Single-arm dumbbell press|Dumbbell lateral raise|Lean-away lateral raise|Dumbbell front raise|Rear-delt fly|Bent-over reverse fly|Cuban press|Dumbbell upright row|Dumbbell Y raise|Dumbbell scaption|Powell raise");
  add("strength", "shoulders", "cable / machine", "Keep tension continuous and control the return.", "Machine shoulder press|Cable lateral raise|Behind-body cable lateral raise|Cable front raise|Cable Y raise|Cable rear-delt fly|Cable upright row|Reverse pec deck|Landmine lateral raise|Face pull to overhead press");

  add("strength", "biceps", "free weights", "Keep the upper arm quiet and squeeze without swinging.", "Barbell curl|EZ-bar curl|Wide-grip curl|Close-grip curl|Preacher curl|Spider curl|Incline dumbbell curl|Alternating dumbbell curl|Hammer curl|Cross-body hammer curl|Concentration curl|Zottman curl|Drag curl|Bayesian cable curl|High cable curl|Reverse curl|Waiter curl|21s curl");
  add("strength", "triceps", "free weights / cable", "Keep elbows stable and finish by straightening the arm fully.", "Skull crusher|EZ-bar skull crusher|Dumbbell skull crusher|Overhead dumbbell extension|Single-arm overhead extension|Cable pressdown|Rope pressdown|Reverse-grip pressdown|Single-arm pressdown|Overhead cable extension|Cross-body cable extension|Close-grip bench press|JM press|Bench dip|Parallel-bar dip|Diamond push-up|Tate press|Kickback");
  add("strength", "forearms", "free weights", "Move slowly through the wrist and keep the grip firm.", "Wrist curl|Reverse wrist curl|Behind-back wrist curl|Farmer carry|Suitcase carry|Plate pinch|Dead hang|Towel hang|Fat-grip hold|Wrist roller|Pronation rotation|Supination rotation");

  add("strength", "core", "bodyweight / cable", "Exhale, brace the trunk and avoid using momentum.", "Front plank|Side plank|High plank|Plank shoulder tap|Long-lever plank|Dead bug|Bird dog|Hollow hold|Hollow rock|Reverse crunch|Bicycle crunch|V-up|Toe touch|Leg raise|Hanging knee raise|Hanging leg raise|Captain chair raise|Ab wheel rollout|Stability-ball rollout|Cable crunch|Pallof press|Cable wood chop|Russian twist|Suitcase carry|Bear crawl|Mountain climber|Dragon flag progression|L-sit progression");

  add("yoga", "full body", "mat", "Breathe steadily and lengthen through the spine rather than forcing depth.", "Mountain pose|Raised hands pose|Forward fold|Half lift|Downward-facing dog|Upward-facing dog|Cobra pose|Child's pose|Cat-cow|Low lunge|High lunge|Crescent lunge|Warrior I|Warrior II|Warrior III|Reverse warrior|Extended side angle|Triangle pose|Revolved triangle|Half moon pose|Chair pose|Eagle pose|Tree pose|Dancer pose|Garland pose|Pyramid pose|Wide-legged forward fold|Bridge pose|Wheel pose|Camel pose|Locust pose|Bow pose|Boat pose|Crow pose|Side crow progression|Dolphin pose|Headstand progression|Shoulder stand|Plow pose|Fish pose|Pigeon pose|Lizard pose|Happy baby|Supine twist|Corpse pose|Sun salutation A|Sun salutation B|Moon salutation");

  add("pilates", "core", "mat", "Keep the pelvis controlled and connect movement to slow breathing.", "Pilates hundred|Roll up|Roll over|Single-leg circle|Rolling like a ball|Single-leg stretch|Double-leg stretch|Scissors|Lower lift|Criss-cross|Spine stretch|Open-leg rocker|Corkscrew|Saw|Swan dive|Single-leg kick|Double-leg kick|Neck pull|Side kick series|Teaser|Hip circles|Swimming|Leg pull front|Leg pull back|Side bend|Boomerang|Seal|Control balance|Pilates push-up|Shoulder bridge");

  add("mobility", "full body", "bodyweight / band", "Use slow breaths and explore only the range you can control.", "Neck controlled circles|Shoulder controlled circles|Scapular wall slide|Band dislocate|Thread the needle|Open book rotation|Thoracic extension on foam roller|Quadruped thoracic rotation|Wrist rocks|Elbow rotations|90-90 hip switches|Hip controlled circles|World's greatest stretch|Couch stretch|Half-kneeling hip flexor stretch|Adductor rock-back|Frog stretch|Deep squat pry|Ankle knee-to-wall|Calf stretch|Hamstring floss|Sciatic nerve glide|Figure-four stretch|Pigeon mobility|Cossack mobility|Jefferson curl|Wall angel|Lat stretch|Doorway pec stretch|Foam-roll upper back");

  add("cardio", "full body", "machine / outdoors", "Keep a pace you can sustain with smooth breathing and good posture.", "Brisk walk|Incline treadmill walk|Easy jog|Tempo run|Interval run|Hill sprint|Track sprint|Stationary bike|Outdoor cycling|Rowing machine|Elliptical|Stair climber|Swimming freestyle|Swimming breaststroke|Jump rope|Battle rope waves|Sled push|Sled drag|Farmer carry conditioning|Shadow boxing|Heavy-bag rounds|Dance cardio|Hiking|Rucking|Aqua jogging");
  add("hiit", "full body", "bodyweight / equipment", "Work hard without losing form; stop the interval when technique breaks down.", "Burpee|Half burpee|Squat thrust|High knees|Fast feet|Skater jump|Jumping jack|Seal jack|Lateral shuffle|Mountain climber sprint|Plank jack|Tuck jump|Broad jump|Box jump|Lateral box jump|Medicine-ball slam|Wall ball|Kettlebell swing|Kettlebell snatch|Kettlebell clean and press|Dumbbell thruster|Devil press|Bear crawl sprint|Shuttle run|Bike sprint|Row sprint|Battle rope slam|Sled sprint|Punch-out interval|Step-up sprint");

  window.Nourish.exerciseCatalog = exercises;
}());
