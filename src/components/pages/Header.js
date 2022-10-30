import { Button, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

const styles = createUseStyles({
  root: {
    width: '100%',
    height: '5%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    position: 'fixed',
    left: 0,
    top: 0,
    textAlign: 'center',
  },
  userContainer: {
    justifySelf: 'end',
    alignSelf: 'center',
    marginRight: '20px',
  },
});

function Header(props) {
  const classes = styles();
  const navigate = useNavigate();
  const { user } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const goToSettings = () => {
    navigate('/user/preferences');
  };

  return (
    <div className={classes.root}>
      <div />
      <a href="/">
        <h2>
          Automatic Air Quality System
        </h2>
      </a>
      {!user.username ? <div /> : (
        <div className={classes.userContainer}>
          <Button
            id="user-button"
            aria-controls={open ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            {user.username}
          </Button>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'user-button',
            }}
          >
            <MenuItem onClick={goToSettings}>Change Settings</MenuItem>
          </Menu>
        </div>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    user: state.user.user,
  };
}

export default connect(mapStateToProps)(Header);
