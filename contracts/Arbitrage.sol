// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8;
pragma experimental ABIEncoderV2;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/ICallee.sol";
import "./interfaces/DydxFlashloanBase.sol";

contract Arbitrage is ICallee, DydxFlashloanBase {
    address payable public owner;
    //0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    IUniswapV2Router02 uniswap;
    //0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506
    IUniswapV2Router02 sushiswap;
    //0x4EC3570cADaAEE08Ae384779B0f3A45EF85289DE
    address SOLO;

    //0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa
    IERC20 dai;
    //0xd0a1e359811322d97991e03f863a0c30c2cf029c
    IERC20 weth;

    constructor(
        address uniswapAddress,
        address sushiswapAddress,
        address dYdXSoloAddress,
        address wethAddress
    ) public {
        owner = payable(msg.sender);
        uniswap = IUniswapV2Router02(uniswapAddress);
        sushiswap = IUniswapV2Router02(sushiswapAddress);
        SOLO = dYdXSoloAddress;
        weth = IERC20(wethAddress);
    }

    struct MyCustomData {
        address token1;
        address token2;
        // direction = 0 -> Uniswap to Sushiswap, direction = 1 -> Sushiswap to Uniswap
        uint8 direction;
        uint256 repayAmount;
    }

    function callFunction(
        address sender,
        Account.Info memory account,
        bytes memory data
    ) public override {
        require(msg.sender == SOLO, "!solo");
        require(sender == address(this), "!this contract");

        MyCustomData memory myCustomData = abi.decode(data, (MyCustomData));
        uint256 repayAmount = myCustomData.repayAmount;

        IERC20 token1 = IERC20(myCustomData.token1);
        IERC20 token2 = IERC20(myCustomData.token2);

        IUniswapV2Router02 exchange1;
        IUniswapV2Router02 exchange2;

        if (myCustomData.direction == 0) {
            exchange1 = uniswap;
            exchange2 = sushiswap;
        } else {
            exchange1 = sushiswap;
            exchange2 = uniswap;
        }

        uint256 balanceToken1 = IERC20(token1).balanceOf(address(this));
        require(balanceToken1 >= repayAmount, "bal < repay");

        token1.approve(address(exchange1), balanceToken1);

        address[] memory path = new address[](2);
        path[0] = address(token1);
        path[1] = address(token2);
        uint256[] memory minOuts = exchange1.getAmountsOut(balanceToken1, path);

        exchange1.swapExactTokensForTokens(
            balanceToken1,
            minOuts[1],
            path,
            address(this),
            block.timestamp
        );

        uint256 balanceToken2 = token2.balanceOf(address(this));

        token2.approve(address(exchange2), balanceToken2);

        address[] memory path1 = new address[](2);
        path1[0] = address(token2);
        path1[1] = address(token1);
        uint256[] memory minOuts1 = exchange2.getAmountsOut(
            balanceToken2,
            path1
        );

        exchange2.swapExactTokensForTokens(
            balanceToken2,
            minOuts1[1],
            path1,
            address(this),
            block.timestamp
        );

        token1.transfer(owner, token1.balanceOf(address(this)) - repayAmount);
    }

    function initiateFlashLoan(
        address _token1,
        address _token2,
        uint256 _amount,
        uint8 _direction
    ) external {
        ISoloMargin solo = ISoloMargin(SOLO);

        // Get marketId from token address
        /*
    0	WETH
    1	SAI
    2	USDC
    3	DAI
    */
        uint256 marketId = _getMarketIdFromTokenAddress(SOLO, _token1);

        // Calculate repay amount (_amount + (2 wei))
        uint256 repayAmount = _getRepaymentAmountInternal(_amount);
        IERC20(_token1).approve(SOLO, repayAmount);

        /*
    1. Withdraw
    2. Call callFunction()
    3. Deposit back
    */

        Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

        operations[0] = _getWithdrawAction(marketId, _amount);
        operations[1] = _getCallAction(
            abi.encode(
                MyCustomData({
                    token1: _token1,
                    token2: _token2,
                    direction: _direction,
                    repayAmount: repayAmount
                })
            )
        );
        operations[2] = _getDepositAction(marketId, repayAmount);

        Account.Info[] memory accountInfos = new Account.Info[](1);
        accountInfos[0] = _getAccountInfo();

        solo.operate(accountInfos, operations);
    }

    function wethReturn() public {
        uint256 balanceWeth = weth.balanceOf(address(this));
        weth.transfer(owner, balanceWeth);
    }

    function wethValue() public view returns (uint256 value) {
        return weth.balanceOf(address(this));
    }

    function checkBalance() public view returns (uint256 value) {
        return address(this).balance;
    }

    function getEthback() public payable {
        uint256 balanceEth = address(this).balance;
        owner.transfer(balanceEth);
    }

    // function daiValue() public view returns (uint256 value) {
    //     uint256 balanceDai = dai.balanceOf(address(this));
    //     return balanceDai;
    // }

    // function getDai() public payable {
    //     dai.transfer(owner, dai.balanceOf(address(this)));
    // }

    //receive() external payable {}
}
