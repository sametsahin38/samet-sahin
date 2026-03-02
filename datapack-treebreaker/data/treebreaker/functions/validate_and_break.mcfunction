scoreboard players set #has_leaf tb.leaf 0
execute as @e[type=minecraft:marker,tag=tb_target,limit=1,sort=nearest] at @s run function treebreaker:has_leaves
execute if score #has_leaf tb.leaf matches 0 run return 0

execute as @e[type=minecraft:marker,tag=tb_target,limit=1,sort=nearest] run scoreboard players set @s tb.depth 0
execute as @e[type=minecraft:marker,tag=tb_target,limit=1,sort=nearest] at @s run function treebreaker:break_step
