import express from "express";

const router = express.Router();

const wireframes = [
  {
    id: 1,
    name: "Wireframe 1",
    description: "This is the first wireframe.",
  },
  {
    id: 2,
    name: "Wireframe 2",
    description: "This is the second wireframe.",
  },
];

router.get("/", (req, res) => {
  res.json(wireframes);
});

export default router;
