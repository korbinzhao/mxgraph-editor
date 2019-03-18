import React from 'react';
import PropTypes from 'prop-types';
import { message, Tooltip } from 'antd';

import './toolbar.less';

const userGuideText = 'group the cells selected';

message.config({
  top: 60,
  duration: 2,
  maxCount: 3,
});

class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {
    
  }

  render() {
    const {
      editor, updateDiagramData,
    } = this.props;

    const graph = editor && editor.graph;

    return [
      <div key="toolbar" className="toolbar">
        <div
          className="toolbar-btn"
          onClick={() => {
            const diagramXml = window.localStorage.getItem('autosaveXml');

            updateDiagramData(diagramXml);
          }}
        >
          <img className="icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQBAMAAAB8P++eAAAAKlBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHrpZrAAAADXRSTlMA+pZAwX/f0PBapw4o4hbINAAAAVNJREFUSMft1j1Lw0AcBvDTYmvbxUFwCgjOQtTBxW6Cg7gIHUQK7hKo6Cr4AQxkcc8XEFx0FlwcXIJvofB8F/93yaXtvSQ3OJV7htALvyb/kIM8jC1cdq9gzcbW1O2jNtfSdYN6mCUl3EFDPksYNcGf8s70M7+JkR1qCZAf8bmKe/fIJexE/m82Eb7YCsFUrNpiCCtkI+BCrFaBsQ4/KkgXuhOnlsSlFdjDsYQ02pqEmxocYSLhci0slk4Q/w5zN7jt+jDvuLfCbBb2h690DAzwEQjVN9gCH0CB9EYvVfgCfGtwQHvobG8uD7HYLgrsmPfsWIMtMww1yIfUQyNqsBvrLk8MkD3fqu73nJkg67/NP/XBEzNDSzz00EMPPWyGaR2sqkJRPuzpyPLRnnYqYwayzvCCFNod/6ykVeVaH9pyGlWVy7nEuddC56LpXF3dy/Ci5A/XP8FNp6uo9QAAAABJRU5ErkJggg==" alt="保存" />
          <span>save</span>
        </div>
        <Tooltip placement="top" title={userGuideText}>
          <div
            className="toolbar-btn"
            onClick={() => {
              const cellsSelected = graph.getSelectionCells();

              if (!(cellsSelected && cellsSelected.length > 1)) {
                return false;
              }

              let hasGroupCell = false;
              cellsSelected.forEach((cell) => {
                if (cell.isGroupCell || cell.isGrouped) {
                  hasGroupCell = true;
                }
              });

              if (hasGroupCell) {
                message.warning('can not group twice on the same cell');

                return false;
              }

              const allCells = graph.model.cells;

              let groupCount = 1;
              allCells && Object.keys(allCells).forEach((index) => {
                if (allCells[index].isGroupCell) {
                  groupCount += 1;
                }
              });

              const groupName = `group${groupCount}`;

              const { cellsGrouped } = editor.groupCells(cellsSelected, groupName);

              const nodeCodes = [];

              cellsGrouped.forEach((item) => {
                if (item.nodeCode) {
                  nodeCodes.push(item.nodeCode);
                }
              });

              return true;
            }}
          >
            <img className="icon" alt="group" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABQBAMAAABrHX9XAAAAIVBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAt9G3DAAAACnRSTlMAgH808J8RYM+wXRwwVQAAAURJREFUSMft1z1PwkAYwPGaRkicJHFyJE5OahtiWEkcmJgcnBg73syug59CE8nB8ym5a3ovzxvEyaj3TKT95Z+2V1qoqn6uAc2l24S3QJXN79Wf8fNZ0B9x00XRRX9f5yPoI1N0mrWmRwIevWq6NVx3sJJ1vbQ8/Q5bWbcARji3IU50vQR4YvEXGOJEu/TXHdPnIY61Ty+EixLiWMvpFEdaS8c40lo6xnOtp0M81yz9MI1z08cz7dP7tH/KXgvbXLfsBUE0rJL26RPaJO3unRPa5kfSMX0/iXPl0+ws0/4JvYIWX8FHdXH61TFY+yNfqItj6cp3WnxIY63GhzS5Y5V4SBOtxEOaftPEeExTLcbnIc2eEC6+o3ocnxpUu/gbO+6N1Z5s3W7N9NioT83n8t75Ud00s2O6bppc35bfVf9W/+l/XgfmX60ajQbWQwAAAABJRU5ErkJggg==" />
            <span>group</span>
          </div>
        </Tooltip>

        <Tooltip placement="top" title="ungroup the cells in a group">
          <div
            className="toolbar-btn"
            onClick={() => {
              const cellsSelected = graph.getSelectionCells();

              if (!(cellsSelected && cellsSelected.length !== 0)) {
                return false;
              }

              editor.ungroupCells();

              return true;
            }}
          >
            <img className="icon" alt="ungroup" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABQBAMAAABrHX9XAAAAJFBMVEUAAABHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADmfSdFAAAAC3RSTlOAAJJAd6NwHwrGSfPfHfwAAAFOSURBVEjH7Ze9boMwEIAPKRsLzo+EskXKlqnq0Jk5U2amzh3zBBkzdouUKW9QIRopupersQ+w8fUCXao23Ib96QP77LMBZSJGLyKV+A0fFoO/TtOzjoToqGmJR3qkf0Dvn18EuukFFURIN/FY9EGkU59enET6uPPo/HYQ6PRcuPQC8V2gj4grh94gXgX6DbFo6amuRjuB1q+2ciD1pzTKNCc5BGpuTmo5BGo2OySHQM3SJAejLu5mPjdVGYx6dZeemqoOptBDG08OPXPaTcmHziFQgwlzQGAE8QC6HEjPB9AZqG3vUV71nMx7z+BrlZ1tn+zYNa3prpyjrdqsqo6co2m7VHRHztCktrvBlzO0VpfN3vHlIV2ps3YXx648pGs10VXSLt/Sy1rdniSyu/RqVeL0cd+d+VVzIs7JWo3nzi/Sw24F473qcel//ef1BXCTS0JPUPYbAAAAAElFTkSuQmCC" />
            <span>ungroup</span>
          </div>
        </Tooltip>

        <div
          className="toolbar-btn"
          onClick={() => {
            graph.zoomOut();
          }}
        >
          <img className="icon" alt="zoom out" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAPFBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACHr/7WAAAAE3RSTlMA4zPSVEOXgL76IvAVZgV0CqyLZRk3dAAAAk9JREFUWMPtWNl2hCAMlUVZZNHx//+1dkCLjpBgaU/P6eR1xstNcglJuu5tP26TplS7JlDazoyo5WlEDtx8C81xueJEuGhM6Nt+WrJcGvN3eDo/LllTQzVkz5aijbaO3iP5ds2FsP1qYk5JywqS+oses+aYdLnniFC0uzsR2V+cNu9uIxHtxkFSIL6qR/GDw+68wnOk8b9zMeZaxjiCmTFRzAOkgxhJCQHGkx+wsiKiBxKCPPcTMZytilfbBMGwCXXXQ7JZ6T9DyB2ynmgFOW3CPzj2BoQAkXzlfcA+HC04nRWsCxGkeEBaZsCDomvKEitSkLUENw6ZWzDVRnCPEilVBV9X2YPQdCHHtA6QF/L8DKGqfHtMIYgEe4uRXzlU2br26zIr+iUnVFza8dkKWcmrPgmvyL7J+iWVU1Y1SWHIdw6iOx9rsgwTwAUF6AHAhi6/JoVfJ+XYz+WT0lw2zYUdzhobXr3mxaF5+bpfYMdfegLCr6rhIzU9+StTS5ABDz2e4kSATiO2Ij0WMBAgoAgI0unYPHPYB9z9i80uwxyKKRGGIRrOzWlESzzF5tniEgdy3PDg6NARNVZssw/i6m+IpcFHfA3lHI+YHc34YTBHIGpSmLMdP0/SGMT9GzUf1hYTT0ZmGRWhEIhuSAfw2a/TN7dikMk+Q/ldYxhEcEXAdKJaFGJxicH48R6gEAtrFn4uOEjEVUHDK+ZpbfCoGe7D2mKQm9Qvd1XViOAy7RZi0URzRP+vEWlrxLkZYNwXNAR0tqpJQD38ktjubX/VPgDhoFgXCVTnKAAAAABJRU5ErkJggg==" />
          <span>zoom out</span>
        </div>
        <div
          className="toolbar-btn"
          onClick={() => {
            graph.zoomIn();
          }}
        >
          <img className="icon" alt="zoom in" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAOVBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADLcPMfAAAAEnRSTlMAqHG1L/YigO8JW/yZFUHM3Ew/zqt1AAACZUlEQVRYw+2Y6ZKkIAyAlftGfP+H3W7QKVsJBMfa2q3q/OvB+cgFSZimr/xXopN0NC6cL5E6afTvaN7MfP0QTo2/jWPUrhWxlN3CiXkF5QZSOLs2xM5ijJf4wWvEBKG1CIbQw5/TCI/s/6bmz7jqQ5QkPlN27ylZyRIt1e5JZA75uBnlgATxbtMyojJIb7yl4Xa2bESMjpu9TmO8Qvs8Wcw1ve8Mx0UmFR4icVkhdnbWOYIWlWNlb+URBhNcOpSPXTNjshkzNmFzZGzrELpsBPrOKw5qRJqBBntCPHhEAwikbwtqCvpXIi9+WEXNIQUNlCBZRQ75yGQFwXhK0IumFTQ3BCxhhNIi75bGgKlhc4DXYGDxe4Kv6XkaA+bMAJbk/SUHx8SMAg1sV7xkvSCySLaLbj+kuHg+VoH5Wj9+LICirMT5uC5VYK7sulZMz3I8TDpvUQXyM1CigfxBkwVs8i+CQv9O2ji4nDSA78hZ9+DRa6gR4ARoAFWjCMBrMJDBWty7YGXrgjVgEYWBsVUC9PvwWQLFi0AWg0WqXJY1FYUFOoTYrvQM7NCEMQJy0so6zQpHj0qliLZaIWGRbemxWWru70YGBtJv57Z+bkU1nGHFOMiMtsTdvcs1rUJXP471Di3TYactJmW2tAhT9sFn1v1h5mUKgriPZguBkGk5FBiMjtv+VlWRIe5DM5q4F1B7GW+nIH+0k0zhicAAPquPAXyE2HsiKKPvCHFiFOb9vDgMEVHPLGPE2kPQOUqDxPNTVbrm0TCx7xl1baEeIbrpaeL0MPFBDV/EuEYxPSoP477ylX9Q/gDwhU9EOaS64wAAAABJRU5ErkJggg==" />
          <span>zoom in</span>
        </div>

        <div
          className="toolbar-btn"
          onClick={() => {
            graph.zoomActual();
          }}
        >
          <img className="icon" alt="zoom actual" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAP1BMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC6E+JdAAAAFHRSTlMARqRetTcV7PglA5BWdQqBaOPF1izCXH8AAAL3SURBVFjD7VjZlqQgDBVkR1TE///WUUAFW7Ya65x+6Dx1tXiT3Cwkdt2ffFsE4ZiTd6DwhAxdrTADFRb/BYelx7qEQvAx5mDWR6HTR97jBJx1fhpb4Qhcs6KHRvN0YM4iBwDAoCRc2PVv2GLkfL7IZBRXgeH5yPBqPJWjn8gDkoJKvKlAPZGHwr7JvoWXM6DGxtmbp7IF5L2gZR6xY4jiUta7c6YQazHqRs2wcMzxzXAFN8B5nc1wwVui53ik2cJe7BlU2dqWotPYOVzZTLw/uePInlDVJeUYn5LPnUZ9FK+AMtVLJbRmjbb/UpFnuQ/0J4wdDp5Vvl5MpA8kw8M3w7T9a2S5sBCrToaJ+whI9uSnAeu0Szqyic9pwFIJxHUAEr3zGDNmwwFcvC9AcdQi9+2Qhl6pTFbvEMSSaQLAzaplbwPCKtLsctNkSKQHhbaDTTwA3K+s+ch8tGcLDZ6syyPeaK3fX+NshbwLAIX0T7ZmtACrmoapRjNBtjll55jQQo4YsulEuPeFhv2YZeoER79/RFl0N8DeviXSnaEA2N0BXd6Qjy3sni0cCxw2ALo7rRDlBkB3/ennYzos5VoLUToPr0ppAdSZSpFxSkWAMwKPgPzGU7rbxIAqbikXoMp1m7gf2p8wqFgVsW0CmpJ3wO2puXzpYzPgoYrHNjzPSeedQmZ1gmMVcjgOfnCEOY8Pn3X92sBtszXpAzAXs+Q9Pr81OfhxiY5FlZWzjR/95jIpldOXI8iIigG7aj70R3nViFYxwbpGWJ6sCK2csddauv3snN8Czl2mJsWG8p5C0LnyDdVspzepUQU7ZBXiwHK73nTb8msQr+32to2O4NpGIWD1O8OIwn0ZSjVs+/IU7susP+NXgyhET7MbvY2YaEAM9+KHzxizCMfS2lol8tlKra7otyFunRmxwnebRkT7aQn6dZsiOfxM9nbEYpttRSxq/ALi+jLi2U9+M2L/NUTwNuLSvYyoX/zy22cnsU8EGApJ9ye/VP4BhWJhS4RGFZIAAAAASUVORK5CYII=" />
          <span>zoom actual</span>
        </div>
        <div
          className="toolbar-btn"
          onClick={(e) => {
            e.currentTarget.classList.toggle('active');

            this.panning = !this.panning;

            if (this.panning) {
              editor.startPanning();
            } else {
              editor.stopPanning();
            }
          }}
        >
          <img className="icon" alt="move" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQBAMAAAB8P++eAAAAIVBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAt9G3DAAAACnRSTlMAQGAw8J8T0HFQARRjXAAAAc9JREFUSMfN1r1OwzAQB3CnVSvGIiTEeBJbJkB9AxbUqRNDpmy8AQMbElNfgN0iAt1T4o+4sc8fdwMDHqt/fmp853OUytfmqGRrmGS5DaKMHBAnISgjBxuchKCEHHxwEoI8acAnxE+WNODXPeL1G+IzBz52iLsXxO+RAe9scGvIVwZUNqjapAN9sE060AebZOfAOWifqu5lb8EQ3DT+5MqCIaiGxmvfqih4MTJVDEF2/VVwVw52WVF0Odgfs6JAKbiifWmqrEvBnpbHVzkP7kmr+7YpBNeHlIzB9GVSMgHTYEomINnwmExBEozJFKQlXEgC0uBCEjBrikBSMAsG0oA/l/G6QXxPfjg58jy+2usY5iG3JtsfkqVNx4kWuJbjX0a7JhZsD8xdzG24ns8FW0I4H4x2U+jzUWPaDKKz1mrc5civ2kcB4gnaOFw6nqCt4wrpUK4OAJ0O5fpIATrnK0NK0zlfG3tAB+RYDm7/07DPL6SHei654tYHUKJLc59t4bIV8TVsqzzWxeViz6qssiZywaxtCqQLNsGZtEEG9KQNMqAnzSfXFQc60nzEfXCgWoYbcOXuwzxUMhL4Lutl4EyCpHF7GehIEWhIGWjIEvgLL6GmI/dLvbEAAAAASUVORK5CYII=" />
          <span>move</span>
        </div>
      </div>,
    ];
  }
}

Toolbar.propTypes = {
  updateDiagramData: PropTypes.func,
};

// Specifies the default values for props:
Toolbar.defaultProps = {
  updateDiagramData: () => {},
};

export default Toolbar;
