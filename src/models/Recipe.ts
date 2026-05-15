import mongoose, { Schema, model, models } from "mongoose";

const RecipeSchema = new Schema({
  title: String,
  prepTime: String,
  cookTime: String,
  difficulty: String,
  ingredients: [String],
  instructions: [String],
  lang: String,
  createdAt: { type: Date, default: Date.now },
});

const Recipe = models.Recipe || model("Recipe", RecipeSchema);

export default Recipe;