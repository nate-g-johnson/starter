const pool = require("../database/")
const { get } = require("../routes/static")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
  *  Get a single vehicle
  * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0] // single vehicle
  } catch (error) {
    console.error("getVehicleById error " + error)
    throw error
  }
}

async function addClassification(classification_name) {
  const sql = `INSERT INTO public.classification (classification_name) VALUES ($1)`
  return pool.query(sql, [classification_name])
}

async function addInventory(invData) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price } = invData
  const sql = `INSERT INTO public.inventory
    (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`
  return pool.query(sql, [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price])
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    
    console.log("Running UPDATE for inv_id:", inv_id)

    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])

    console.log("Update query rowCount:", data.rowCount)
    console.log("Update returned row:", data.rows[0])

    return data.rows[0]
  } catch (error) {
    console.error("updateInventory error: " + error)
    throw error
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("deleteInventoryItem error: " + error)
    throw error
  }
}

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleById, 
  addClassification, 
  addInventory, 
  updateInventory,
  deleteInventoryItem
}
