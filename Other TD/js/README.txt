Note that this is not optimized for any format but full-sized Chrome browsers. The purpose of this is experimenting with game mechanics and design, not, for the time being, cross-platform availability.



Multiple Canvases:

The only canvas a player can interact with is the one their mouse is over. So, when a mouse event is registered by one of the canvases, that canvas swaps the global current canvas so that appropriate input functions respond to the appropriate canvas.



Enemy Computer:
The enemy will begin its action by determining how "comfortable" it is. It does this by considering a series of factors:
	relative income
	relative tower strengths
	strength of monsters currently on enemy's side
	how much gold enemy has available (represents potential to increase defense or press offense)

	Advanced:
		player gold buildups (anticipate a rush)
		press the advantage: if enemy monster strength outstrips player tower strength, attack!
		convert gold to potential monster strength

	Slacking in income:
		Sending monsters overcomes
		But lower income means disadvantage, which means play defensively
		What to choose?
		Computed with logarithm of ratio. Incomes (10, 5), is just as bad for the 5 as is (2000, 1000), as income builds up over time and is not just about numerical difference. Act accordingly.

Each of these criteria contribute an amount of comfort to the enemy's total count; 0 indicates neutral, while higher is comfortable, lower is cautious. Ranges are segmented into 5 categories, followed by tower probability:
	Defensive (0.9)
	Cautious (0.7)
	Neutral (0.5)
	Confident (0.3)
	Aggressive (0.1)

It then acts based on probability. Low comfort begets a defensive playstyle, favoring buying towers and upgrades over sending monsters. High comfort is the reverse.

The enemy also has a sense of urgency. The more urgent, the more often it will act. Urgency can be spurred by defensive behaviour (e.g., player's monster strength greatly outstrips enemy's tower strength: place & upgrade towers quickly!), or by offensive behaviour (player's tower strength is low, press the advantage and send monsters!).

Urgency is defined by two factors:
	direct parallels: that is, if the player has better/more towers, monsters, or income, act more
	push-pull relationships: if the player has stronger monsters than your tower (comfort as defined above)
If the enemy is defensive or aggressive, it will definitely be urgent. But, in the absence of comfort variation, the direct parallels can define urgency as well. This is to account for this kind of situation: player's monster strength is similar to enemy's tower strength, but the player seems to be bolstering towers without a comparable increase in monsters. Don't sit idly thinking enemy is comfortable, but increase urgency to act more


Strengths:
Tower strength is a tower's value.

Monster strength is incremented exponentially. That is, a monster's strength is (type + 1) ^ 2.

The defensive strength of a side is considered equal to the opposite side's offensive strength if the strongest tower could deal 5% or more of the strongest monster's health in 1 second. This is an arbitrary definition.



Monster Levels:
Currently, there's a basic system in place to improve monsters over time. Essentially, after every 100 of any given monster type, all future instances of that monster type double in health and receive a small speed upgrade (up to a limit of 2x original speed). This can continue indefinitely, leading to a guaranteed game termination (no stalemate).
