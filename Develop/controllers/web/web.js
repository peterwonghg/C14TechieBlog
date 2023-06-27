const authenticate = require('../../middleware/authenticate');
const { Blog, User } = require('../../models');

const router = require('express').Router();



//  / -- list of blogs
router.get('/', (req, res) => {

  Blog.findAll({
    include: [
      {model: User}
    ]
  })
    .then((blogs) => {
      res.render('index', {
        blogs: blogs.map((blog) => blog.get({ plain: true })),
        logged_in: req.session.logged_in,
      })
    }).catch((err) => {

      res.render('error')
    })
});


// /blog/:id --- show a blog
router.get('/blog/:id', (req,res) => {

  Blog.findByPk(req.params.id, {
    include: [
      {model: User},
    ]
  }).then((data) => {

    const blog = data.get({plain: true});


    res.render('blog', {
      logged_in: req.session.logged_in,
      blog: blog,
    })
  })
})

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res.render('login', {
        error: "Incorrect email or password, please try again"
      });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res.render('login', {
        error: "Incorrect email or password, please try again"
      });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.redirect('/profile');
      
    });

  } catch (err) {
    res.status(400).json(err);
  }

})


// /login -- show login form & sign up
router.get('/login', (req, res) => {
  res.render('login', {
    logged_in: req.session.logged_in,

  });
})

router.get('/signup', (req, res) => {
  res.render('signup', {
    logged_in: req.session.logged_in,

  });
})

router.post('/signup', async (req, res) => {

  try {
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.redirect('/profile')
    });
  } catch (err) {
    res.render('signup', {
      error: "Something went wrong"
    });
  }
})


// /profile (protected)-- current user blogs & create new blog
// & delete blog
router.use(authenticate);
router.get('/profile', (req, res) => {

  // need the current user
  User.findByPk(req.session.user_id, {
    include: [
      {model: blog}
    ]
  }).then((userData) => {
    res.render('profile', {
      logged_in: req.session.logged_in,
      user: userData.get({plain: true}),
    })

  })

  // need the current user blog

})


router.post('/profile/blogs/:id/delete', (req, res) => {
  blog.destroy({
    where: {
      id: req.params.id,
    }
  })

  // TODO: continue
  
})




module.exports = router;