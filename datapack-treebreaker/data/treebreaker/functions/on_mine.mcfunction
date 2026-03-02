# Tekrar tetiklenebilmesi icin advancement'i geri al
advancement revoke @s only treebreaker:mined_log

# Sadece balta ile calissin
execute unless data entity @s SelectedItem{id:"minecraft:wooden_axe"} unless data entity @s SelectedItem{id:"minecraft:stone_axe"} unless data entity @s SelectedItem{id:"minecraft:iron_axe"} unless data entity @s SelectedItem{id:"minecraft:golden_axe"} unless data entity @s SelectedItem{id:"minecraft:diamond_axe"} unless data entity @s SelectedItem{id:"minecraft:netherite_axe"} run return 0

kill @e[type=minecraft:marker,tag=tb_target,distance=..16]
function treebreaker:find_target
execute unless entity @e[type=minecraft:marker,tag=tb_target,limit=1,distance=..6] run return 0

function treebreaker:validate_and_break
kill @e[type=minecraft:marker,tag=tb_target,distance=..16]
