const { commands } = require("configs");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName(commands.KICK_ROLE)
  .setDescription("Kick tất cả member có role được chọn")
  .addRoleOption((option) =>
    option
      .setName("role")
      .setDescription("Chọn role cần kick")
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

const kickNoRoleScb = new SlashCommandBuilder()
  .setName(commands)
  .setDescription("Kick person without role");
