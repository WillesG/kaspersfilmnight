/* ========================================
   KASPER'S FILM NIGHT -- Hoofdpagina Script
   ======================================== */

var PANTRY_ID = "60eda3f0-b164-4072-bf6b-b824a2bc5c91";
var PANTRY_URL = "https://getpantry.cloud/apiv1/pantry/" + PANTRY_ID + "/basket/";
var BASKET_NAME = "comments_main";

document.addEventListener("DOMContentLoaded", function() {
    loadEventDetails();
    loadTrailer();
    loadComments();
    setupCommentForm();
});

function loadEventDetails() {
    var container = document.getElementById("movieShowcase");
    
    if (!container) {
        return;
    }
    
    if (!CURRENT_EVENT || !CURRENT_EVENT.title) {
        container.innerHTML = "<div class=\"no-movie-message\">Nog geen filmavond gepland! Kom snel terug.</div>";
        return;
    }
    
    var posterHtml = "";
    if (CURRENT_EVENT.poster) {
        posterHtml = "<img src=\"" + escapeHtml(CURRENT_EVENT.poster) + "\" alt=\"" + escapeHtml(CURRENT_EVENT.title) + "\">";
    } else {
        posterHtml = "<div class=\"poster-placeholder\">🎬</div>";
    }
    
    var messageHtml = "";
    if (CURRENT_EVENT.message) {
        messageHtml = "<p class=\"movie-message\">💬 " + escapeHtml(CURRENT_EVENT.message) + "</p>";
    }
    
    container.innerHTML = "<div class=\"movie-card-large\">" +
        "<div class=\"movie-poster-wrap\">" +
            "<div class=\"movie-poster\">" + posterHtml + "</div>" +
        "</div>" +
        "<div class=\"movie-info\">" +
            "<span class=\"movie-label\">🎟️ Volgende Film</span>" +
            "<h2 class=\"movie-title\">" + escapeHtml(CURRENT_EVENT.title) + "</h2>" +
            "<div class=\"movie-details\">" +
                "<div class=\"movie-detail-item\">" +
                    "<span class=\"detail-icon\">📅</span>" +
                    "<span>" + escapeHtml(CURRENT_EVENT.date) + "</span>" +
                "</div>" +
                "<div class=\"movie-detail-item\">" +
                    "<span class=\"detail-icon\">🕖</span>" +
                    "<span>" + escapeHtml(CURRENT_EVENT.time) + "</span>" +
                "</div>" +
            "</div>" +
            messageHtml +
        "</div>" +
    "</div>";
}

function loadTrailer() {
    var wrapper = document.getElementById("trailerWrapper");
    var section = document.getElementById("trailerSection");
    
    if (!wrapper || !section) {
        return;
    }
    
    if (!CURRENT_EVENT || !CURRENT_EVENT.youtubeId) {
        section.style.display = "none";
        return;
    }
    
    section.style.display = "block";
    wrapper.innerHTML = "<iframe src=\"https://www.youtube.com/embed/" + escapeHtml(CURRENT_EVENT.youtubeId) + "?rel=0\" title=\"Trailer\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>";
}

function loadComments() {
    var container = document.getElementById("commentsList");
    
    if (!container) {
        return;
    }
    
    container.innerHTML = "<div class=\"no-comments\">💬 Reacties laden...</div>";
    
    fetch(PANTRY_URL + BASKET_NAME, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var comments = data.comments || [];
        
        if (comments.length === 0) {
            container.innerHTML = "<div class=\"no-comments\">💬 Nog geen reacties. Wees de eerste!</div>";
            return;
        }
        
        comments.sort(function(a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        var html = "";
        for (var i = 0; i < comments.length; i++) {
            var comment = comments[i];
            html += "<div class=\"comment-item\">" +
                "<div class=\"comment-header\">" +
                    "<span class=\"comment-author\">🍿 " + escapeHtml(comment.name || "Anoniem") + "</span>" +
                    "<span class=\"comment-time\">" + formatTime(comment.timestamp) + "</span>" +
                "</div>" +
                "<p class=\"comment-text\">" + escapeHtml(comment.text || "") + "</p>" +
            "</div>";
        }
        container.innerHTML = html;
    })
    .catch(function(error) {
        container.innerHTML = "<div class=\"no-comments\">💬 Nog geen reacties. Wees de eerste!</div>";
    });
}

function setupCommentForm() {
    var submitBtn = document.getElementById("submitComment");
    var nameInput = document.getElementById("commenterName");
    var textInput = document.getElementById("commentText");
    
    if (!submitBtn || !nameInput || !textInput) {
        return;
    }
    
    submitBtn.onclick = function(e) {
        e.preventDefault();
        
        var name = nameInput.value.trim();
        var text = textInput.value.trim();
        
        if (!name) {
            alert("Vul je naam in!");
            nameInput.focus();
            return;
        }
        
        if (!text) {
            alert("Schrijf een bericht!");
            textInput.focus();
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span class=\"btn-popcorn-icon\">⏳</span> Verzenden...";
        
        fetch(PANTRY_URL + BASKET_NAME, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var comments = data.comments || [];
            
            comments.push({
                name: name,
                text: text,
                timestamp: Date.now()
            });
            
            if (comments.length > 50) {
                comments = comments.slice(-50);
            }
            
            return fetch(PANTRY_URL + BASKET_NAME, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ comments: comments })
            });
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Save failed");
            }
            nameInput.value = "";
            textInput.value = "";
            loadComments();
            submitBtn.innerHTML = "<span class=\"btn-popcorn-icon\">✅</span> Verstuurd!";
            
            setTimeout(function() {
                submitBtn.innerHTML = "<span class=\"btn-popcorn-icon\">🍿</span> Verstuur Bericht";
                submitBtn.disabled = false;
            }, 2000);
        })
        .catch(function(error) {
            alert("Er ging iets mis. Probeer opnieuw.");
            submitBtn.innerHTML = "<span class=\"btn-popcorn-icon\">🍿</span> Verstuur Bericht";
            submitBtn.disabled = false;
        });
    };
}

function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

function formatTime(timestamp) {
    if (!timestamp) return "";
    
    var date = new Date(timestamp);
    var now = new Date();
    var diff = now - date;
    
    if (diff < 60000) return "Zojuist";
    if (diff < 3600000) {
        var mins = Math.floor(diff / 60000);
        return mins + " minuten geleden";
    }
    if (diff < 86400000) {
        var hours = Math.floor(diff / 3600000);
        return hours + " uur geleden";
    }
    if (diff < 604800000) {
        var days = Math.floor(diff / 86400000);
        return days + " dagen geleden";
    }
    
    return date.toLocaleDateString("nl-NL", { 
        day: "numeric",
        month: "short"
    });
}
