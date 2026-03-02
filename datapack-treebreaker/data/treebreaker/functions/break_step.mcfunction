# Bu katmandaki loglari kir (3x3 alan)
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:oak_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:spruce_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:birch_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:jungle_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:acacia_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:dark_oak_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:mangrove_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:cherry_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:pale_oak_log
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:crimson_stem
fill ~-1 ~ ~-1 ~1 ~ ~1 air replace minecraft:warped_stem

scoreboard players add @s tb.depth 1
execute if score @s tb.depth matches ..11 positioned ~ ~1 ~ run function treebreaker:break_step
