
/*
  Simple schedule loader
  Loads the combined Marlboro HS athletics schedule JSON
*/

fetch('marlboro_schedule_all_sports.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(scheduleData => {
    console.log('Schedule loaded:', scheduleData);

    // Example access pattern:
    // scheduleData["Wrestling"]["boys"]["Boys Varsity"]
    // Object.keys(...) will give you event names

  })
  .catch(error => {
    console.error('Error loading schedule:', error);
  });
