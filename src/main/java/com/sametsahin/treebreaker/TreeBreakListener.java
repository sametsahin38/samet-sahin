package com.sametsahin.treebreaker;

import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.Tag;
import org.bukkit.block.Block;
import org.bukkit.block.BlockFace;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class TreeBreakListener implements Listener {

    private static final BlockFace[] FACES = {
            BlockFace.UP, BlockFace.DOWN,
            BlockFace.NORTH, BlockFace.SOUTH,
            BlockFace.EAST, BlockFace.WEST,
            BlockFace.NORTH_EAST, BlockFace.NORTH_WEST,
            BlockFace.SOUTH_EAST, BlockFace.SOUTH_WEST,
            BlockFace.UP_NORTH, BlockFace.UP_SOUTH,
            BlockFace.UP_EAST, BlockFace.UP_WEST,
            BlockFace.DOWN_NORTH, BlockFace.DOWN_SOUTH,
            BlockFace.DOWN_EAST, BlockFace.DOWN_WEST,
            BlockFace.UP_NORTH_EAST, BlockFace.UP_NORTH_WEST,
            BlockFace.UP_SOUTH_EAST, BlockFace.UP_SOUTH_WEST,
            BlockFace.DOWN_NORTH_EAST, BlockFace.DOWN_NORTH_WEST,
            BlockFace.DOWN_SOUTH_EAST, BlockFace.DOWN_SOUTH_WEST
    };

    private final JavaPlugin plugin;
    private final Set<UUID> activePlayers = new HashSet<>();

    public TreeBreakListener(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        if (activePlayers.contains(player.getUniqueId())) {
            return;
        }

        FileConfiguration config = plugin.getConfig();
        if (!config.getBoolean("tree-break.enabled", true)) {
            return;
        }

        ItemStack tool = player.getInventory().getItemInMainHand();
        if (!isAxe(tool.getType())) {
            return;
        }

        Block brokenBlock = event.getBlock();
        if (!isLog(brokenBlock.getType())) {
            return;
        }

        int minTrunkHeight = config.getInt("tree-break.min-trunk-height", 3);
        int maxLogs = config.getInt("tree-break.max-logs-per-tree", 96);
        int leafScanRadius = config.getInt("tree-break.leaf-scan-radius", 2);
        int minNearbyLeaves = config.getInt("tree-break.min-nearby-leaves", 6);

        if (!looksLikeTree(brokenBlock, minTrunkHeight, leafScanRadius, minNearbyLeaves)) {
            return;
        }

        Set<Block> connectedLogs = collectConnectedLogs(brokenBlock, maxLogs);
        if (connectedLogs.size() <= 1) {
            return;
        }

        activePlayers.add(player.getUniqueId());
        try {
            for (Block log : connectedLogs) {
                if (log.equals(brokenBlock)) {
                    continue;
                }
                if (log.getType().isAir()) {
                    continue;
                }
                log.breakNaturally(tool, true);
            }
        } finally {
            activePlayers.remove(player.getUniqueId());
        }
    }

    private Set<Block> collectConnectedLogs(Block start, int maxLogs) {
        Set<Block> visited = new HashSet<>();
        ArrayDeque<Block> queue = new ArrayDeque<>();

        queue.add(start);
        visited.add(start);

        while (!queue.isEmpty() && visited.size() < maxLogs) {
            Block current = queue.poll();
            for (BlockFace face : FACES) {
                Block next = current.getRelative(face);
                if (visited.contains(next)) {
                    continue;
                }
                if (!isLog(next.getType())) {
                    continue;
                }
                visited.add(next);
                queue.offer(next);

                if (visited.size() >= maxLogs) {
                    break;
                }
            }
        }

        return visited;
    }

    private boolean looksLikeTree(Block start, int minTrunkHeight, int leafScanRadius, int minNearbyLeaves) {
        int verticalLogs = 1;
        Block cursor = start;
        while (true) {
            cursor = cursor.getRelative(BlockFace.UP);
            if (!isLog(cursor.getType())) {
                break;
            }
            verticalLogs++;
        }

        if (verticalLogs < minTrunkHeight) {
            return false;
        }

        int nearbyLeaves = countNearbyLeaves(start.getLocation(), leafScanRadius);
        return nearbyLeaves >= minNearbyLeaves;
    }

    private int countNearbyLeaves(Location center, int radius) {
        int leaves = 0;

        for (int x = -radius; x <= radius; x++) {
            for (int y = -1; y <= radius + 2; y++) {
                for (int z = -radius; z <= radius; z++) {
                    Block block = center.getWorld().getBlockAt(
                            center.getBlockX() + x,
                            center.getBlockY() + y,
                            center.getBlockZ() + z
                    );
                    if (isLeaf(block.getType())) {
                        leaves++;
                    }
                }
            }
        }

        return leaves;
    }

    private boolean isLog(Material material) {
        return Tag.LOGS.isTagged(material) || material == Material.MANGROVE_ROOTS;
    }

    private boolean isLeaf(Material material) {
        return Tag.LEAVES.isTagged(material) || material == Material.NETHER_WART_BLOCK || material == Material.WARPED_WART_BLOCK;
    }

    private boolean isAxe(Material material) {
        return switch (material) {
            case WOODEN_AXE, STONE_AXE, IRON_AXE, GOLDEN_AXE, DIAMOND_AXE, NETHERITE_AXE -> true;
            default -> false;
        };
    }
}
