/* =========================================
   Customer Manager — Dashboard Interactions
   Vanilla JavaScript, no frameworks
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Card press animation
  var cards = document.querySelectorAll(".dashboard-card");

  cards.forEach(function (card) {
    card.addEventListener("pointerdown", function () {
      card.classList.add("pressed");
    });

    card.addEventListener("pointerup", function () {
      card.classList.remove("pressed");
    });

    card.addEventListener("pointerleave", function () {
      card.classList.remove("pressed");
    });
  });

    // Logout button
  var logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      location.href = "index.html";
    });
  }
});
