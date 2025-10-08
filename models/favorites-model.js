const pool = require("../database")

async function addFavorite(account_id, inv_id) {
  try {
    const sql = `INSERT INTO public.favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *`
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    // If duplicate due to race condition or UNIQUE constraint, return null so controller can handle gracefully
    if (error.code === "23505") { // Postgres unique_violation
      return null
    }
    console.error("addFavorite error:", error)
    throw error
  }
}

async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `DELETE FROM public.favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *`
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0] // deleted row or undefined
  } catch (error) {
    console.error("removeFavorite error:", error)
    throw error
  }
}

async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT f.favorite_id, f.added_at, i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_image, i.inv_thumbnail
      FROM public.favorites AS f
      JOIN public.inventory AS i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY f.added_at DESC
    `
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getFavoritesByAccount error:", error)
    throw error
  }
}

async function checkFavorite(account_id, inv_id) {
  try {
    const sql = `SELECT * FROM public.favorites WHERE account_id = $1 AND inv_id = $2`
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("checkFavorite error:", error)
    throw error
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccount,
  checkFavorite,
}
