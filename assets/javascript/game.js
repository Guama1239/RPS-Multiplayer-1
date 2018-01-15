$(document).ready(function(){
    var config = {
      apiKey: "AIzaSyA7ta-TS3GcFmLzxhl1SwZuEVIqDbzmHfc",
      authDomain: "rps-qg.firebaseapp.com",
      databaseURL: "https://rps-qg.firebaseio.com",
      projectId: "rps-qg",
      storageBucket: "rps-qg.appspot.com",
      messagingSenderId: "946643017034"
    };
    firebase.initializeApp(config);
    var database = firebase.database();
    var playersRef = database.ref("/playerData");

    var p1 = {wins:0, losses:0};
    var p2 = {wins:0, losses:0};
    var playerlist = [];
    var numPlayers = 0;
    var getPlayerInfo = function(){
            playersRef.on("value",function(snap){
            numPlayers = snap.numChildren();
            if(snap.val()){
                playerlist = Object.keys(snap.val());
            };
        })
    }
    var displayOptionsP1 = function(){
        $(".p1").find(".option").show();
        $(".p1").find(".rock").text("Rock");
        $(".p1").find(".paper").text("Paper");
        $(".p1").find(".scissors").text("Scissors");
        $(".p2").find(".option").hide();
    };
    var displayOptionsP2 = function(){
        $(".p2").find(".option").show();
        $(".p2").find(".rock").text("Rock");
        $(".p2").find(".paper").text("Paper");
        $(".p2").find(".scissors").text("Scissors");
        $(".p1").find(".option").hide();
    };

    var displayNameScoresP1 = function(){
        $(".p1").find("h2").text(p1.name);
        $(".p1").find(".wins").text("Wins: "+ p1.wins);
        $(".p1").find(".losses").text("Losses: "+ p1.losses);
    }
    var displayNameScoresP2 = function(){
        $(".p2").find("h2").text(p2.name);
        $(".p2").find(".wins").text("Wins: "+ p2.wins);
        $(".p2").find(".losses").text("Losses: "+ p2.losses);
    }
    var updateNameScores = function(){
        playersRef.child("p1").on("value", function(snap){
            if(snap.val()){
                p1.name = snap.val().name;
                p1.wins = snap.val().wins;
                p1.losses = snap.val().losses;
                displayNameScoresP1();
            }
        });
        playersRef.child("p2").on("value", function(snap){
            if(snap.val()){
                p2.name = snap.val().name;
                p2.wins = snap.val().wins;
                p2.losses = snap.val().losses;
                displayNameScoresP2();
            }
        })
    }

    var uponTurnChange = function(){
        database.ref().child("turn").on("value",function(snap){
            if(snap.val()){
                if(snap.val()===1){
                    $(".p1").addClass("active");
                    $(".p2").removeClass("active");
                    if(p1.role === "user"){
                        displayOptionsP1();
                        displayTurn();
                    } else {
                        displayWait();
                    }
                } else if(snap.val()===2){
                    $(".p2").addClass("active"); 
                    $(".p1").removeClass("active");
                    if(p2.role === "user"){
                        displayOptionsP2();
                        displayTurn();
                    } else{
                        displayWait();
                    }
                } else if(snap.val()===3){           
                    judge();
                    storeWinsLosses();
                    var timeoutID = setTimeout(function(){
                        database.ref().child("turn").set(1);
                        $(".result").text("");
                        startNewRound();
                        $(".note2").html("")
                    }, 3000)
                }
            }    
        })
    }

    var storeDisplayChoice = function(player, choice){
        playersRef.child(player).update({
            choice: choice
        })
        $(".option").hide();
        var ch = $("<span class = 'picked'>").text(choice)
        $("."+ player).find(".options").append(ch);
    }  

    $(".p1").on("click",".option",function(){
        var c = $(this).attr("data-choice");
        storeDisplayChoice("p1", c);
        database.ref().child("turn").set(2);
    })

    $(".p2").on("click",".option",function(){
        var c = $(this).attr("data-choice");
        storeDisplayChoice("p2", c);
        database.ref().child("turn").set(3);
    })

    var getChoiceP1 = function(){
        playersRef.child("p1").child("choice").on("value",function(snap){
            p1.choice = snap.val()
        })
    }
    var getChoiceP2 = function(){
        playersRef.child("p2").child("choice").on("value",function(snap){
            p2.choice = snap.val()
        })
    }
    var judge = function(){     
        if ((p1.choice === "ROCK") && (p2.choice === "SCISSORS")) {
            p1.wins++;
            p2.losses++;
            $(".result").text(p1.name + " Wins!")
        } else if ((p1.choice=== "ROCK") && (p2.choice === "PAPER")) {
            p1.losses++;
            p2.wins++;
            $(".result").text(p2.name + " Wins!")
        } else if ((p1.choice === "SCISSORS") && (p2.choice === "ROCK")) {
            p1.losses++;
            p2.wins++;
            $(".result").text(p2.name + " Wins!")
        } else if ((p1.choice === "SCISSORS") && (p2.choice === "PAPER")) {
            p1.wins++;
            p2.losses++;
            $(".result").text(p1.name + " Wins!")
        } else if ((p1.choice === "PAPER") && (p2.choice === "ROCK")) {
            p1.wins++;
            p2.losses++;
            $(".result").text(p1.name + " Wins!")
        } else if ((p1.choice === "PAPER") && (p2.choice === "SCISSORS")) {
            p1.losses++;
            p2.wins++;
            $(".result").text(p2.name + " Wins!")
        } else if (p1.choice === p2.choice) {
            $(".result").text("Tie Game!")
        }     
    }
    var storeWinsLosses = function(){
        playersRef.child("p1").update({
            wins: p1.wins,
            losses: p1.losses
        })
        playersRef.child("p2").update({
            wins: p2.wins,
            losses: p2.losses
        })
    };
    var startNewRound = function(){
        $(".picked").empty();
        if(p1.role === "user"){
            $(".option").show();
        };
    }
    var displayWait = function(){
        var name = p1.role === "user" ? p2.name:p1.name;
        var inform = $("<h3>").text("Waiting for " +name+ " to choose")
        $(".note2").html(inform)
    }
    var displayTurn = function(){
        var notification = $("<h3>").text("It's your turn!")
        $(".note2").html(notification);
    }
    var startGame = function(){
        playersRef.on("child_added",function(snap,prevChildkey){
            if(prevChildkey){           
                database.ref().child("turn").set(1);
                database.ref().child("turn").onDisconnect().remove();  
                if(p1.role === "user"){
                    displayOptionsP1();
                }
                console.log("both ready")
            } 
        })
    }

    var restart = function(){
    playersRef.on("child_removed", function(snap,prevChildkey){

    })
    }
    
    $(".signInButton").on("click",function(){
        event.preventDefault();
        userName = $(".name").val();
        if(numPlayers === 2){
            alert("please wait");
        } else if(numPlayers===1 && playerlist[0]==="p1"){
            p2.role = "user";
            playersRef.child("p2").set({
                name: userName,
                wins: 0,
                losses: 0
            });
            $(".note").html(`<h3>Hi Lil'${userName}, you are player 2!</h3>`)
            $(".p2").find("h3").text(userName);
            playersRef.child("p2").onDisconnect().remove() 
        } else{
            p1.role = "user";
            p1.name = userName;
            playersRef.child("p1").set({
                name: userName,
                wins: 0,
                losses: 0
            });
            $(".note").html(`<h3>Hi Lil'${userName}, you are player 1! </h3>`) 
            $(".p1").find("h3").text(userName); 
            playersRef.child("p1").onDisconnect().remove()  
        }        
        $(".signIn").hide();        
    });

    getPlayerInfo();
    updateNameScores();
    startGame();
    uponTurnChange();
    getChoiceP1();
    getChoiceP2();

}) 