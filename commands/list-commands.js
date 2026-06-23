const { commands } = require("../config");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const kickWithsRoleScb = new SlashCommandBuilder()
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
  .setName(commands.KICK_NO_ROLE)
  .setDescription("Kick person without role");

module.exports = [kickNoRoleScb, kickWithsRoleScb]
